// src/app/[locale]/(DashboardLayout)/layout/vertical/header/Cart.tsx
"use client";

import React, { useContext, useState } from "react";
import { sum } from "lodash";
import { IconShoppingCart, IconX } from "@tabler/icons-react";
import {
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import CartItems from "./CartItem";
import { ProductContext } from "@/app/context/Ecommercecontext";
import type { ProductType } from "@/app/[locale]/(DashboardLayout)/types/apps/eCommerce";

const Cart = () => {
  const productContext = useContext(ProductContext);

  if (!productContext) {
    return null;
  }

  const { cartItems } = productContext;
  const [showDrawer, setShowDrawer] = useState(false);

  const bcount = cartItems.length;
  const total = sum(
    cartItems.map((product: ProductType) => product.price * product.qty)
  );

  return (
    <Box>
      <IconButton
        size="large"
        color="inherit"
        onClick={() => setShowDrawer(true)}
        sx={{
          color: "text.secondary",
          ...(showDrawer && {
            color: "primary.main",
          }),
        }}
      >
        <Badge color="error" badgeContent={bcount}>
          <IconShoppingCart size={21} stroke={1.5} />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        slotProps={{
          paper: { sx: { maxWidth: "500px" } },
        }}
      >
        <Box display="flex" alignItems="center" p={3} pb={0} justifyContent="space-between">
          <Typography variant="h5" fontWeight={600}>
            Shopping Cart
          </Typography>

          <Box>
            <IconButton
              color="inherit"
              sx={{
                color: (theme) => theme.palette.grey.A200,
              }}
              onClick={() => setShowDrawer(false)}
            >
              <IconX size="1rem" />
            </IconButton>
          </Box>
        </Box>

        <Box>
          <CartItems />
        </Box>

        <Box px={3} mt={2}>
          {cartItems.length > 0 ? (
            <>
              <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="subtitle2" fontWeight={400}>
                  Total
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                  ${total}
                </Typography>
              </Stack>

              <Button
                fullWidth
                component={Link}
                href="/apps/ecommerce/checkout"
                variant="contained"
                color="primary"
              >
                Checkout
              </Button>
            </>
          ) : null}
        </Box>
      </Drawer>
    </Box>
  );
};

export default Cart;