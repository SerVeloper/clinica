import {
  Activity,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  EyeOff,
  LogOut,
  MessageCircle,
  Pencil,
  Phone,
  Users,
} from '@lucide/vue'

export const iconos = {
  activar: Check,
  calendario: CalendarDays,
  desactivar: EyeOff,
  editar: Pencil,
  especialidad: ClipboardList,
  mensaje: MessageCircle,
  operaciones: Activity,
  profesional: BriefcaseBusiness,
  salir: LogOut,
  usuarios: Users,
  telefono: Phone,
  siguiente: ChevronRight,
} as const

export type NombreIcono = keyof typeof iconos
