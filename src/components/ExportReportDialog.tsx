import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import { durationMinutes, formatDuration } from '../domain/duration';
import type { Activity, Customer } from '../domain/types';
import {
  MONTH_NAMES,
  buildReport,
  periodRange,
  reportFileName,
  type ReportActivity,
  type ReportPeriod,
} from '../domain/workReport';
import { monoFontFamily } from '../theme';
import { ResponsiveDialog } from './ResponsiveDialog';

export interface ExportReportDialogProps {
  open: boolean;
  onClose: () => void;
  customer: Customer;
  authorName: string;
  authorEmail: string;
  /** Načte ukončené činnosti zákazníka pro zvolené období. */
  loadActivities: (from: Date, to: Date) => Promise<Activity[]>;
  onDownloaded: (fileName: string) => void;
  /** Roky, které má nabídka obsahovat; nejnovější první. */
  years: number[];
}

/** Výchozí období je předchozí měsíc; v lednu tedy prosinec loňského roku. */
function defaultPeriod(now: Date): { year: number; month: number } {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0–11, tedy už o měsíc zpět
  return month === 0 ? { year: year - 1, month: 12 } : { year, month };
}

export function ExportReportDialog({
  open,
  onClose,
  customer,
  authorName,
  authorEmail,
  loadActivities,
  onDownloaded,
  years,
}: ExportReportDialogProps) {
  const initial = useMemo(() => defaultPeriod(new Date()), []);
  const [kind, setKind] = useState<'month' | 'year'>('month');
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);
  const [loaded, setLoaded] = useState<{ key: string; activities: Activity[] } | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const period: ReportPeriod =
    kind === 'month' ? { kind: 'month', year, month } : { kind: 'year', year };

  const yearOptions = useMemo(
    () => (years.includes(year) ? years : [year, ...years]).sort((a, b) => b - a),
    [years, year],
  );

  const periodKey = `${kind}|${year}|${month}`;

  // Souhrn v dialogu se počítá ze stejného dotazu, který pak naplní soubor —
  // číslo na obrazovce tak nemůže nesedět s obsahem výkazu. Stav se mění jen
  // v callbacku, ne v těle efektu; výsledek se drží spolu s klíčem období,
  // aby po přepnutí měsíce chvíli nesvítila stará čísla.
  useEffect(() => {
    if (!open) return;
    const key = periodKey;
    const { from, to } = periodRange(
      kind === 'month' ? { kind: 'month', year, month } : { kind: 'year', year },
    );
    let cancelled = false;

    loadActivities(from, to)
      .then((result) => {
        if (!cancelled) setLoaded({ key, activities: result });
      })
      .catch((error) => {
        console.error('Nepodařilo se načíst činnosti pro výkaz:', error);
        if (!cancelled) {
          setLoaded({ key, activities: [] });
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, periodKey, kind, month, year, loadActivities]);

  const activities = loaded?.key === periodKey ? loaded.activities : null;
  const loading = activities === null;
  const totalMinutes = (activities ?? []).reduce(
    (sum, activity) => sum + (activity.end ? durationMinutes(activity.start, activity.end) : 0),
    0,
  );
  const invoicedMinutes = (activities ?? [])
    .filter((activity) => activity.invoiced)
    .reduce(
      (sum, activity) => sum + (activity.end ? durationMinutes(activity.start, activity.end) : 0),
      0,
    );
  const fileName = reportFileName(customer.name, period);

  async function download() {
    if (!activities) return;
    setBusy(true);
    try {
      const reportActivities: ReportActivity[] = activities
        .filter((activity): activity is Activity & { end: Date } => activity.end !== null)
        .map((activity) => ({
          name: activity.name,
          start: activity.start,
          end: activity.end,
          invoiced: activity.invoiced,
          invoiceDate: activity.invoiceDate,
          note: activity.note,
        }));

      const workbook = buildReport({
        customer: {
          name: customer.name,
          ico: customer.ico,
          dic: customer.dic,
          address: customer.address,
        },
        author: { name: authorName, email: authorEmail },
        period,
        activities: reportActivities,
        issuedAt: new Date(),
      });

      // ExcelJS i zápis souboru se načítají až tady, aby nezatěžovaly start aplikace.
      const { buildXlsx, downloadBlob } = await import('../export/writeWorkbook');
      downloadBlob(await buildXlsx(workbook), workbook.fileName);
      onDownloaded(workbook.fileName);
      onClose();
    } catch (error) {
      console.error('Výkaz se nepodařilo vytvořit:', error);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title="Stáhnout pracovní výkaz"
      subtitle={customer.name}
      maxWidth={480}
      actions={
        <>
          <Button onClick={onClose}>Zrušit</Button>
          <Button
            variant="contained"
            color="success"
            disabled={loading || busy}
            onClick={() => void download()}
          >
            Stáhnout .xlsx
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={kind}
          onChange={(_, next: 'month' | 'year' | null) => next && setKind(next)}
        >
          <ToggleButton value="month">Za měsíc</ToggleButton>
          <ToggleButton value="year">Za rok</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {kind === 'month' && (
            <TextField
              select
              label="Měsíc"
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              sx={{ flex: 1 }}
            >
              {MONTH_NAMES.map((name, index) => (
                <MenuItem key={name} value={index + 1}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            select
            label="Rok"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            sx={{ flex: 1 }}
          >
            {yearOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 3,
            bgcolor: 'rgba(0,0,0,0.03)',
            borderRadius: 1,
            px: 2,
            py: 1.5,
            minHeight: 64,
            alignItems: 'center',
          }}
        >
          {loading ? (
            <CircularProgress size={20} />
          ) : (
            <>
              <Summary label="Činností" value={String((activities ?? []).length)} />
              <Summary label="Vykázáno" value={formatDuration(totalMinutes)} mono />
              <Summary label="Vyfakturováno" value={formatDuration(invoicedMinutes)} mono success />
            </>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: 0.5,
              bgcolor: '#1d6f42',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
            aria-hidden
          >
            X
          </Box>
          <Typography sx={{ fontFamily: monoFontFamily, fontSize: 12, overflowWrap: 'anywhere' }}>
            {fileName}
          </Typography>
        </Box>

        {!loading && activities?.length === 0 && !failed && (
          <Typography variant="body2" sx={{ color: 'warning.main' }}>
            V tomto období nejsou žádné ukončené činnosti. Soubor bude obsahovat jen hlavičku.
          </Typography>
        )}
        {failed && <Alert severity="error">Data pro výkaz se nepodařilo načíst.</Alert>}
      </Box>
    </ResponsiveDialog>
  );
}

function Summary({
  label,
  value,
  mono,
  success,
}: {
  label: string;
  value: string;
  mono?: boolean;
  success?: boolean;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" component="div">
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 500,
          fontFamily: mono ? monoFontFamily : undefined,
          color: success ? 'success.main' : 'text.primary',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
