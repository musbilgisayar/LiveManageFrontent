 // src/modules/roles/pages/page.tsx      
import { useState } from "react";
import { useI18nNs } from "@/app/context/i18nContext";
import { useRoles } from "../hooks/useRoles";
import { roleService } from "../services/roleService";
import {
  RoleToolbar,
  RoleList,
  RoleFormDialog,
  RoleDeleteDialog,
} from "../components";     
