import { api } from "~/core/api/client";

export interface CreateEmpleadoPayload {
  username: string;
  nombre: string;
  apellidos: string;
  password: string;
  dni: string;        // RUT chileno (enviado como 'dni' al backend)
  rol: "empleado" | "administrador";
}

export interface EmpleadoCreado {
  id: number;
  username: string;
  nombre: string;
  apellidos: string;
  rol: string;
  dni: string;
}

export async function createEmpleado(payload: CreateEmpleadoPayload): Promise<EmpleadoCreado> {
  return api.post<EmpleadoCreado>("/auth/empleados", payload);
}
