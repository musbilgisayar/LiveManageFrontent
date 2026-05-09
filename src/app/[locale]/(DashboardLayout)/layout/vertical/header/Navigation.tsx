"use client";

import { useState } from "react";
import { Box, Menu, Typography, Button, Divider, Grid } from "@mui/material";
import Link from "next/link";
import { IconChevronDown, IconHelp } from "@tabler/icons-react";

import AppLinks from "./AppLinks";
import QuickLinks from "./QuickLinks";

const AppDD = () => {
  const [anchorEl2, setAnchorEl2] = useState<HTMLButtonElement | null>(null);

  const open = Boolean(anchorEl2);

  const handleClick2 = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  return (
    <>
      <Box>
        <Button
          id="apps-menu-button"
          aria-label="apps menu"
          aria-controls={open ? "msgs-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          color="inherit"
          variant="text"
          sx={{
            bgcolor: open ? "primary.light" : "",
            color: open
              ? "primary.main"
              : (theme) => theme.palette.text.secondary,
          }}
          onClick={handleClick2}
          endIcon={
            <IconChevronDown
              size="15"
              style={{ marginLeft: "-5px", marginTop: "2px" }}
            />
          }
        >
          Apps
        </Button>

        <Menu
          id="msgs-menu"
          anchorEl={anchorEl2}
          open={open}
          onClose={handleClose2}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          transformOrigin={{ horizontal: "left", vertical: "top" }}
          disableAutoFocusItem
          MenuListProps={{
            "aria-labelledby": "apps-menu-button",
            autoFocus: false,
          }}
          sx={{
            "& .MuiMenu-paper": {
              width: "850px",
            },
            "& .MuiMenu-paper ul": {
              p: 0,
            },
          }}
        >
          <Grid container>
            <Grid
              display="flex"
              size={{
                sm: 8,
              }}
            >
              <Box p={4} pr={0} pb={3}>
                <AppLinks />

                <Divider />

                <Box
                  sx={{
                    display: {
                      xs: "none",
                      sm: "flex",
                    },
                  }}
                  alignItems="center"
                  justifyContent="space-between"
                  pt={2}
                  pr={4}
                >
                  <Link href="/faq" onClick={handleClose2}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="600"
                      color="textPrimary"
                      display="flex"
                      alignItems="center"
                      gap="4px"
                    >
                      <IconHelp width={24} />
                      Frequently Asked Questions
                    </Typography>
                  </Link>

                  <Button variant="contained" color="primary">
                    Check
                  </Button>
                </Box>
              </Box>

              <Divider orientation="vertical" />
            </Grid>

            <Grid
              size={{
                sm: 4,
              }}
            >
              <Box p={4}>
                <QuickLinks />
              </Box>
            </Grid>
          </Grid>
        </Menu>
      </Box>

      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/apps/chats"
        component={Link}
      >
        Chat
      </Button>

      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/apps/calendar"
        component={Link}
      >
        Calendar
      </Button>

      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/apps/email"
        component={Link}
      >
        Email
      </Button>
    </>
  );
};

export default AppDD;