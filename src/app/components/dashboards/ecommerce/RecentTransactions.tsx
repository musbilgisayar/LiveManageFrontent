'use client';

import React, { useEffect } from 'react';
import DashboardCard from '../../shared/DashboardCard';

// MUI Lab (modül bazlı import)
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';

import { Box, CircularProgress, Link, Typography } from '@mui/material';
import { useI18nNs } from '@/app/context/i18nContext';

type DotColor =
  | 'inherit'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'grey';

export type RecentTxItem = {
  id?: string;
  time: string;              // "09:30" / "09:30 am" — yerelleştirilmiş string önerilir
  color?: DotColor;          // timeline dot rengi
  content: React.ReactNode;  // sağ içerik
};

type Props = {
  title?: string;                  // varsayılan: t('dashboard:recentTransactions.title')
  items?: RecentTxItem[];          // verilmezse i18n tabanlı örnek içerik
  loading?: boolean;
  maxHeight?: number | string;     // uzun listelerde scroll
  ns?: string;                     // i18n namespace (varsayılan 'dashboard')
};

// Basit UI event logging
function auditBeacon(event: string, extra?: Record<string, unknown>) {
  try {
    const payload = JSON.stringify({ event, ts: new Date().toISOString(), ...extra });
    navigator.sendBeacon?.('/api/audit/ui-events', payload);
  } catch { /* swallow */ }
}

const RecentTransactions: React.FC<Props> = ({
  title,
  items,
  loading = false,
  maxHeight = 340,
  ns = 'dashboard',
}) => {
  // Çok dilli bağlam
  const { t, lang, ready } = useI18nNs([ns]);

  // Varsayılan i18n içerik (`,string` sonekleri KALDIRILDI)
  // Gerekli key önerileri:
  // dashboard:recentTransactions.title
  // dashboard:recentTransactions.timeline,aria
  // dashboard:recentTransactions.empty
  // dashboard:recentTransactions.items.paymentReceived
  // dashboard:recentTransactions.items.newSale
  // dashboard:recentTransactions.items.paymentMade
  // dashboard:recentTransactions.items.newArrival
  // dashboard:recentTransactions.items.paymentDone
  const defaultItemsI18n: RecentTxItem[] = [
    {
      id: 'tx-1',
      time: '09:30',
      color: 'primary',
      content: <>{t(`${ns}:recentTransactions.items.paymentReceived`) || 'Payment received from John Doe of $385.90'}</>,
    },
    {
      id: 'tx-2',
      time: '10:00',
      color: 'secondary',
      content: (
        <>
          <Typography component="span" fontWeight={600}>
            {t(`${ns}:recentTransactions.items.newSale`) || 'New sale recorded'}
          </Typography>{' '}
          <Link href="/" underline="none">#ML-3467</Link>
        </>
      ),
    },
    {
      id: 'tx-3',
      time: '12:00',
      color: 'success',
      content: <>{t(`${ns}:recentTransactions.items.paymentMade`) || 'Payment was made of $64.95 to Michael'}</>,
    },
    {
      id: 'tx-4',
      time: '13:45',
      color: 'warning',
      content: (
        <>
          <Typography component="span" fontWeight={600}>
            {t(`${ns}:recentTransactions.items.newSale`) || 'New sale recorded'}
          </Typography>{' '}
          <Link href="/" underline="none">#ML-3467</Link>
        </>
      ),
    },
    {
      id: 'tx-5',
      time: '15:10',
      color: 'error',
      content: (
        <>
          <Typography component="span" fontWeight={600}>
            {t(`${ns}:recentTransactions.items.newArrival`) || 'New arrival recorded'}
          </Typography>{' '}
          <Link href="/" underline="none">#ML-3467</Link>
        </>
      ),
    },
    {
      id: 'tx-6',
      time: '18:00',
      color: 'success',
      content: <>{t(`${ns}:recentTransactions.items.paymentDone`) || 'Payment Done'}</>,
    },
  ];

  const titleText   = title ?? (t(`${ns}:recentTransactions.title`) || 'Recent Transactions');
  const emptyText   = t(`${ns}:recentTransactions.empty`) || 'No recent transactions.';
  const timelineAria = t(`${ns}:recentTransactions.timeline,aria`) || 'Recent transactions timeline';

  useEffect(() => {
    auditBeacon('recentTransactionsViewed', { lang });
  }, [lang]);

  const data = items ?? defaultItemsI18n;

  return (
    <DashboardCard title={titleText}>
      <Box
        key={`${lang}-recent-transactions`}
        aria-label="recent-transactions"
        aria-busy={!ready}
        sx={{
          maxHeight,
          overflowY: 'auto',
          pr: 1,
          pointerEvents: ready ? 'auto' : 'none',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : data.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            {emptyText}
          </Typography>
        ) : (
          <Timeline
            aria-label={timelineAria}
            className="theme-timeline"
            sx={{
              p: 0,
              mb: '-40px',
              [`& .${timelineOppositeContentClasses.root}`]: {
                flex: 0.5,
                paddingLeft: 0,
              },
            }}
          >
            {data.map((it, i) => {
              const isLast = i === data.length - 1;
              const key = it.id ?? `${it.time}-${i}`;
              return (
                <TimelineItem key={key}>
                  <TimelineOppositeContent>{it.time}</TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={it.color ?? 'primary'} variant="outlined" />
                    {!isLast && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>{it.content}</TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        )}
      </Box>
    </DashboardCard>
  );
};

export default RecentTransactions;


/*'use client'
import React from 'react';
import DashboardCard from '../../shared/DashboardCard';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  timelineOppositeContentClasses,
} from '@mui/lab';
import { Link, Typography } from '@mui/material';

const RecentTransactions = () => {
  return (
    <DashboardCard title="Recent Transactions">
      <>
        <Timeline
          className="theme-timeline"
          nonce={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
          sx={{
            p: 0,
            mb: '-40px',
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.5,
              paddingLeft: 0,
            },
          }}
        >
          <TimelineItem>
            <TimelineOppositeContent>09:30 am</TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="primary" variant="outlined" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>Payment received from John Doe of $385.90</TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineOppositeContent>10:00 am</TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="secondary" variant="outlined" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography fontWeight="600">New sale recorded</Typography>{' '}
              <Link href="/" underline="none">
                #ML-3467
              </Link>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineOppositeContent>12:00 am</TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="success" variant="outlined" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>Payment was made of $64.95 to Michael</TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineOppositeContent>09:30 am</TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="warning" variant="outlined" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography fontWeight="600">New sale recorded</Typography>{' '}
              <Link href="/" underline="none">
                #ML-3467
              </Link>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineOppositeContent>09:30 am</TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="error" variant="outlined" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography fontWeight="600">New arrival recorded</Typography>{' '}
              <Link href="/" underline="none">
                #ML-3467
              </Link>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineOppositeContent>12:00 am</TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="success" variant="outlined" />
            </TimelineSeparator>
            <TimelineContent>Payment Done</TimelineContent>
          </TimelineItem>
        </Timeline>
      </>
    </DashboardCard>
  );
};

export default RecentTransactions;
*/
