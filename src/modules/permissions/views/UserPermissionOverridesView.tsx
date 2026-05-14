// src/modules/permissions/views/UserPermissionOverridesView.tsx
"use client";

import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Fade,
  Grow,
  Paper,
  Slide,
  Stack,
  Typography,
  useTheme,
  Zoom,
} from "@mui/material";
import {
  IconAlertTriangle,
  IconCheck,
  IconHistory,
  IconLayoutGrid,
  IconLayoutList,
  IconShieldCheck,
  IconUserCheck,
  IconUserShield,
  IconUsers,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

import { useI18nNs } from "@/app/context/i18nContext";

import UserPermissionCatalogCardGrid from "../components/user-overrides/UserPermissionCatalogCardGrid";
import UserPermissionCatalogTable from "../components/user-overrides/UserPermissionCatalogTable";
import UserPermissionFilterPanel from "../components/user-overrides/UserPermissionFilterPanel";
import UserPermissionHistoryDialog from "../components/user-overrides/UserPermissionHistoryDialog";
import UserPermissionSummaryCards from "../components/user-overrides/UserPermissionSummaryCards";
import UserPermissionUserPicker from "../components/user-overrides/UserPermissionUserPicker";

import { useUserPermissionOverrides } from "../hooks/useUserPermissionOverrides";

export default function UserPermissionOverridesView() {
  const theme = useTheme();
  const { t } = useI18nNs(["permission"]);
  const vm = useUserPermissionOverrides();
  const isDark = theme.palette.mode === "dark";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: isDark
          ? "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)"
          : "linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%)",
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 3 }, py: 4 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Stack spacing={3}>
            {/* Header Section - Hero Card */}
            <motion.div variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 5,
                  overflow: "hidden",
                  position: "relative",
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.12
                  )}, ${alpha(theme.palette.secondary.main, 0.06)})`,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.15),
                  backdropFilter: "blur(10px)",
                }}
              >
                {/* Decorative elements */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}, transparent)`,
                    pointerEvents: "none",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -80,
                    left: -80,
                    width: 250,
                    height: 250,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${alpha(
                      theme.palette.secondary.main,
                      0.08
                    )}, transparent)`,
                    pointerEvents: "none",
                  }}
                />

                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={3}
                  >
                    <Stack direction="row" spacing={2.5} alignItems="center">
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: `linear-gradient(135deg, ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}, ${alpha(theme.palette.primary.main, 0.1)})`,
                          color: "primary.main",
                          border: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.3
                          )}`,
                          boxShadow: `0 8px 16px ${alpha(
                            theme.palette.primary.main,
                            0.15
                          )}`,
                        }}
                      >
                        <IconUserShield size={32} stroke={1.5} />
                      </Box>

                      <Box>
                        <Typography
                          variant="h4"
                          fontWeight={900}
                          sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                          }}
                        >
                          {t("permission:userOverrides.title")}
                        </Typography>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {t("permission:userOverrides.subtitle")}
                        </Typography>
                      </Box>
                    </Stack>

                    <Zoom in={!!vm.selectedUser} timeout={500}>
                      <Button
                        variant="outlined"
                        startIcon={<IconHistory size={18} />}
                        disabled={!vm.selectedUser}
                        onClick={vm.loadHistory}
                        sx={{
                          borderRadius: 3,
                          borderWidth: 1.5,
                          px: 3,
                          py: 1,
                          transition: "all 0.3s",
                          "&:hover": {
                            borderWidth: 1.5,
                            transform: "translateY(-2px)",
                            boxShadow: `0 4px 12px ${alpha(
                              theme.palette.primary.main,
                              0.2
                            )}`,
                          },
                        }}
                      >
                        {t("permission:userOverrides.actions.history")}
                      </Button>
                    </Zoom>
                  </Stack>

                  {/* Quick stats when user selected */}
                  {vm.selectedUser && (
                    <Fade in={!!vm.selectedUser} timeout={600}>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{ mt: 3, pt: 2 }}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Chip
                          icon={<IconUserCheck size={16} />}
                          label={`${vm.filteredRows.length} Permission`}
                          size="medium"
                          sx={{
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            fontWeight: 600,
                          }}
                        />
                        <Chip
                          icon={<IconUsers size={16} />}
                          label={`${vm.modules.length} Modül`}
                          size="medium"
                          sx={{
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            fontWeight: 600,
                          }}
                        />
                      </Stack>
                    </Fade>
                  )}
                </CardContent>
              </Paper>
            </motion.div>

            {/* Messages Section with animation */}
            <AnimatePresence mode="wait">
              {vm.error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: 3,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.15)}`,
                    }}
                  >
                    {vm.error}
                  </Alert>
                </motion.div>
              )}

              {vm.successMessage && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert
                    severity="success"
                    sx={{
                      borderRadius: 3,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.15)}`,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IconCheck size={18} />
                      <span>{vm.successMessage}</span>
                    </Stack>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* User Selection Card with elevation effect */}
            <motion.div variants={itemVariants}>
              <Card
                sx={{
                  borderRadius: 4,
                  transition: "all 0.3s ease",
                  boxShadow: `0 8px 24px ${alpha(
                    theme.palette.common.black,
                    isDark ? 0.3 : 0.08
                  )}`,
                  "&:hover": {
                    boxShadow: `0 12px 32px ${alpha(
                      theme.palette.common.black,
                      isDark ? 0.4 : 0.12
                    )}`,
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={2} alignItems="center">
                     
                    </Stack>

                    <UserPermissionUserPicker
                      users={vm.users}
                      selectedUser={vm.selectedUser}
                      userSearch={vm.userSearch}
                      loading={vm.userLoading}
                      onSearchChange={vm.setUserSearch}
                      onSearch={vm.searchUsers}
                      onChange={vm.setSelectedUser}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Permissions Section - Only show when user selected */}
            <AnimatePresence mode="wait">
              {vm.selectedUser && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 80 }}
                >
                  <Card
                    sx={{
                      borderRadius: 4,
                      overflow: "hidden",
                      boxShadow: `0 8px 24px ${alpha(
                        theme.palette.common.black,
                        isDark ? 0.3 : 0.08
                      )}`,
                    }}
                  >
                    {/* Permission Header with Gradient */}
                    <Box
                      sx={{
                        background: `linear-gradient(135deg, ${alpha(
                          theme.palette.primary.main,
                          0.08
                        )}, ${alpha(theme.palette.background.paper, 0.02)})`,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        p: { xs: 2, md: 3 },
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                        spacing={2}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              color: "success.main",
                            }}
                          >
                            <IconShieldCheck size={24} stroke={1.5} />
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight={800}>
                              Permission Listesi
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Kullanıcı için permission ayarlarını yapılandırın
                            </Typography>
                          </Box>
                        </Stack>

                        {/* View Mode Toggle with Animation */}
                        <Paper
                          elevation={0}
                          sx={{
                            p: 0.5,
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.common.black, 0.04),
                            display: "inline-flex",
                            gap: 0.5,
                          }}
                        >
                          <Button
                            size="small"
                            variant={vm.filters.viewMode === "table" ? "contained" : "text"}
                            onClick={() => vm.setFilters({ ...vm.filters, viewMode: "table" })}
                            startIcon={<IconLayoutList size={16} />}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              transition: "all 0.2s",
                            }}
                          >
                            Tablo
                          </Button>
                          <Button
                            size="small"
                            variant={vm.filters.viewMode === "grid" ? "contained" : "text"}
                            onClick={() => vm.setFilters({ ...vm.filters, viewMode: "grid" })}
                            startIcon={<IconLayoutGrid size={16} />}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              transition: "all 0.2s",
                            }}
                          >
                            Kart
                          </Button>
                        </Paper>
                      </Stack>
                    </Box>

                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Stack spacing={3}>
                        {/* Filter Panel */}
                        <Slide in direction="down" timeout={400}>
                          <div>
                            <UserPermissionFilterPanel
                              modules={vm.modules}
                              filters={vm.filters}
                              onChange={vm.setFilters}
                            />
                          </div>
                        </Slide>

                        <Divider sx={{ my: 1 }} />

                        {/* Permission List with Animation */}
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={vm.filters.viewMode}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            {vm.filters.viewMode === "table" ? (
                              <UserPermissionCatalogTable
                                rows={vm.filteredRows}
                                disabled={vm.loading}
                                savingPermissionId={vm.savingPermissionId}
                                onToggle={vm.toggleDirectPermission}
                              />
                            ) : (
                              <UserPermissionCatalogCardGrid
                                rows={vm.filteredRows}
                                disabled={vm.loading}
                                savingPermissionId={vm.savingPermissionId}
                                onToggle={vm.toggleDirectPermission}
                              />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State when no user selected */}
            <AnimatePresence mode="wait">
              {!vm.selectedUser && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper
                    sx={{
                      borderRadius: 4,
                      p: 6,
                      textAlign: "center",
                      background: `linear-gradient(135deg, ${alpha(
                        theme.palette.background.paper,
                        0.8
                      )}, ${alpha(theme.palette.background.default, 0.4)})`,
                      backdropFilter: "blur(10px)",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          mx: "auto",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          mb: 2,
                        }}
                      >
                        <IconUserShield size={40} color={theme.palette.primary.main} />
                      </Box>
                    </motion.div>
                    <Typography variant="h6" fontWeight={800} gutterBottom>
                      Kullanıcı Seçilmedi
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Permission işlemlerine başlamak için lütfen bir kullanıcı seçin
                    </Typography>
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>
          </Stack>
        </motion.div>

        {/* History Dialog */}
        <UserPermissionHistoryDialog
          open={vm.historyOpen}
          onClose={() => vm.setHistoryOpen(false)}
          history={vm.history}
        />
      </Box>
    </Box>
  );
}