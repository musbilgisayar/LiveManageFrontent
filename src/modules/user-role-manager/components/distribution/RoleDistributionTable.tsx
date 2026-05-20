"use client";

import {
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type {
  RoleDistributionDto,
} from "../../types/RoleManager.types";

import RoleManagerPanel
  from "../shared/RoleManagerPanel";

type RoleDistributionTableProps = {
  items: RoleDistributionDto[];

  isLoading?: boolean;
};

export default function RoleDistributionTable({
  items,
}: RoleDistributionTableProps) {
  return (
    <RoleManagerPanel
      title="Role Distribution"
      subtitle="System role distribution overview"
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              Role
            </TableCell>

            <TableCell>
              Category
            </TableCell>

            <TableCell>
              Sensitive
            </TableCell>

            <TableCell align="right">
              Active Users
            </TableCell>

            <TableCell>
              Last Assigned
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.roleId}
              hover
            >
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                  >
                    {item.roleName ??
                      "-"}
                  </Typography>

                  {item.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {item.description}
                    </Typography>
                  )}
                </Stack>
              </TableCell>

              <TableCell>
                <Typography
                  variant="body2"
                >
                  {item.category}
                </Typography>
              </TableCell>

              <TableCell>
                {item.isSensitive ? (
                  <Chip
                    size="small"
                    color="warning"
                    label="Sensitive"
                  />
                ) : (
                  <Chip
                    size="small"
                    label="Normal"
                  />
                )}
              </TableCell>

              <TableCell align="right">
                <Typography
                  variant="body2"
                  fontWeight={700}
                >
                  {item.activeUserCount}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {item.lastAssignedAt ??
                    "-"}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </RoleManagerPanel>
  );
}