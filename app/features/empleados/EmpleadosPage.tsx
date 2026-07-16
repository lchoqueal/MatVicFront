import { useState } from "react";
import { UserPlus, Users, ShieldCheck, Briefcase, Loader2, X, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { createEmpleado, type CreateEmpleadoPayload } from "~/core/api/empleados.api";

// ── Utilidad: formatear y validar RUT ──────────────────────────────────────────

function formatRut(raw: string): string {
  // Eliminar todo excepto dígitos y K
  const clean = raw.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv   = clean.slice(-1);
  // Formatear con puntos
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}-${dv}`;
}

function validateRut(rut: string): boolean {
  const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 7) return false;
  const body  = clean.slice(0, -1);
  const dvStr = clean.slice(-1);
  let sum = 0;
  let mult = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const rest = sum % 11;
  const dv = rest === 0 ? "0" : rest === 1 ? "K" : String(11 - rest);
  return dv === dvStr;
}

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface FormState {
  nombre: string;
  apellidos: string;
  username: string;
  password: string;
  dni: string;
  rol: "empleado" | "administrador";
  fechaIngreso: string;
  horarioInicio: string;
  horarioFin: string;
}

const EMPTY_FORM: FormState = {
  nombre: "",
  apellidos: "",
  username: "",
  password: "",
  dni: "",
  rol: "empleado",
  fechaIngreso: new Date().toISOString().split('T')[0],
  horarioInicio: "09:00",
  horarioFin: "18:00",
};

// ── Componente principal ────────────────────────────────────────────────────────

export function EmpleadosPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showPwd, setShowPwd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [rutError, setRutError] = useState("");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleRutChange = (raw: string) => {
    const formatted = formatRut(raw);
    set("dni", formatted);
    if (formatted.length > 8) {
      setRutError(validateRut(formatted) ? "" : "RUT inválido");
    } else {
      setRutError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validateRut(form.dni)) {
      setRutError("RUT inválido. Verifica el número y dígito verificador.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateEmpleadoPayload = {
        username:  form.username.trim(),
        user_name: form.username.trim(), // Enviamos ambos por si el backend espera user_name
        nombre:    form.nombre.trim(),
        apellidos: form.apellidos.trim(),
        password:  form.password,
        dni:       form.dni.replace(/\./g, ""), // Enviar sin puntos al backend
        rol:       form.rol,
        fechaIngreso: form.fechaIngreso,
        horario:   `${form.horarioInicio} a ${form.horarioFin}`,
      };
      await createEmpleado(payload);
      setSuccessMsg(`¡${form.rol === "empleado" ? "Empleado" : "Administrador"} creado exitosamente! Ya puede iniciar sesión.`);
      setForm(EMPTY_FORM);
      setRutError("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate")) {
        setErrorMsg("El nombre de usuario o RUT ya está registrado en el sistema.");
      } else {
        setErrorMsg("Error al crear el usuario. Verifica los datos e intenta nuevamente.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--card)",
    border: "1.5px solid var(--border)",
    color: "var(--text)",
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Cabecera */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>Personal del Sistema</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Agrega nuevos empleados o administradores con acceso al panel
          </p>
        </div>
      </div>

      {/* Grid: formulario + info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─── FORMULARIO ───────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "white", border: "1px solid var(--border)" }}>
            {/* Header card */}
            <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(127,57,67,0.10)" }}>
                <UserPlus className="h-5 w-5" style={{ color: "var(--sidebar)" }} />
              </div>
              <div>
                <h3 className="font-bold text-sm" style={{ color: "var(--text)" }}>Nuevo integrante</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Completa los campos para registrar acceso</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Alertas */}
              {successMsg && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: "rgba(60,177,113,0.08)", border: "1px solid rgba(60,177,113,0.25)" }}>
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                  <p className="text-sm font-medium" style={{ color: "var(--success)" }}>{successMsg}</p>
                  <button type="button" onClick={() => setSuccessMsg("")} className="ml-auto">
                    <X className="h-4 w-4" style={{ color: "var(--success)" }} />
                  </button>
                </div>
              )}
              {errorMsg && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: "rgba(217,83,79,0.08)", border: "1px solid rgba(217,83,79,0.25)" }}>
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--error)" }} />
                  <p className="text-sm font-medium" style={{ color: "var(--error)" }}>{errorMsg}</p>
                  <button type="button" onClick={() => setErrorMsg("")} className="ml-auto">
                    <X className="h-4 w-4" style={{ color: "var(--error)" }} />
                  </button>
                </div>
              )}

              {/* Rol */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Tipo de acceso *</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["empleado", "administrador"] as const).map(r => {
                    const isSelected = form.rol === r;
                    const Icon = r === "empleado" ? Briefcase : ShieldCheck;
                    const label = r === "empleado" ? "Empleado / Cajero" : "Administrador";
                    const desc  = r === "empleado" ? "Acceso a Caja e Inventario" : "Acceso total al sistema";
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => set("rol", r)}
                        className="flex items-center gap-3 p-3.5 rounded-xl text-left transition-all"
                        style={{
                          border: `2px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                          background: isSelected ? "rgba(232,99,90,0.06)" : "var(--card)",
                        }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: isSelected ? "var(--primary)" : "rgba(127,57,67,0.08)" }}>
                          <Icon className="h-4 w-4" style={{ color: isSelected ? "white" : "var(--sidebar)" }} />
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: "var(--text)" }}>{label}</p>
                          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nombre + Apellidos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Nombre *</label>
                  <input
                    type="text"
                    placeholder="María"
                    value={form.nombre}
                    onChange={e => set("nombre", e.target.value)}
                    required
                    disabled={isSaving}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Apellidos *</label>
                  <input
                    type="text"
                    placeholder="González Rojas"
                    value={form.apellidos}
                    onChange={e => set("apellidos", e.target.value)}
                    required
                    disabled={isSaving}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  />
                </div>
              </div>

              {/* RUT */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>RUT *</label>
                <input
                  type="text"
                  placeholder="12.345.678-9"
                  value={form.dni}
                  onChange={e => handleRutChange(e.target.value)}
                  maxLength={12}
                  required
                  disabled={isSaving}
                  style={{ ...inputStyle, borderColor: rutError ? "var(--error)" : "var(--border)" }}
                  onFocus={e => (e.currentTarget.style.borderColor = rutError ? "var(--error)" : "var(--primary)")}
                  onBlur={e => (e.currentTarget.style.borderColor = rutError ? "var(--error)" : "var(--border)")}
                />
                {rutError && <p className="text-xs mt-1 font-medium" style={{ color: "var(--error)" }}>{rutError}</p>}
                <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>Formato: XX.XXX.XXX-X. El dígito verificador puede ser número o K.</p>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Nombre de usuario *</label>
                <input
                  type="text"
                  placeholder="maria.gonzalez"
                  value={form.username}
                  onChange={e => set("username", e.target.value.replace(/\s/g, "."))}
                  required
                  disabled={isSaving}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>Con este usuario podrá iniciar sesión en el sistema.</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Contraseña temporal *</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={e => set("password", e.target.value)}
                    minLength={6}
                    required
                    disabled={isSaving}
                    style={{ ...inputStyle, paddingRight: "44px" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>El empleado deberá cambiarla en su primer ingreso.</p>
              </div>

              {/* Fecha Ingreso y Horario */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Fecha de Ingreso *</label>
                  <input
                    type="date"
                    value={form.fechaIngreso}
                    onChange={e => set("fechaIngreso", e.target.value)}
                    required
                    disabled={isSaving}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Horario de Trabajo *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={form.horarioInicio}
                      onChange={e => set("horarioInicio", e.target.value)}
                      required
                      disabled={isSaving}
                      style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                    <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>a</span>
                    <input
                      type="time"
                      value={form.horarioFin}
                      onChange={e => set("horarioFin", e.target.value)}
                      required
                      disabled={isSaving}
                      style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                  </div>
                </div>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={isSaving || !!rutError}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-60"
                style={{ background: "var(--primary)", boxShadow: "0 4px 16px rgba(232,99,90,0.35)" }}
                onMouseEnter={e => { if (!isSaving) (e.currentTarget as HTMLElement).style.background = "var(--primary-hover)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--primary)"; }}
              >
                {isSaving
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Creando acceso…</>
                  : <><UserPlus className="h-4 w-4" /> Crear {form.rol === "empleado" ? "Empleado" : "Administrador"}</>
                }
              </button>
            </form>
          </div>
        </div>

        {/* ─── INFO LATERAL ──────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Niveles de acceso */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ background: "white", border: "1px solid var(--border)" }}>
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}>
              <Users className="h-4 w-4" style={{ color: "var(--primary)" }} />
              Niveles de acceso
            </h4>
            <div className="space-y-3">
              {[
                { rol: "Empleado / Cajero", permisos: ["Registrar ventas en caja", "Ver y editar inventario"], color: "rgba(127,57,67,0.08)", icon: Briefcase, iconColor: "var(--sidebar)" },
                { rol: "Administrador", permisos: ["Todo lo anterior", "Ver dashboard y métricas", "Gestionar categorías", "Administrar clientes", "Crear empleados"], color: "rgba(232,99,90,0.08)", icon: ShieldCheck, iconColor: "var(--primary)" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.rol} className="p-3 rounded-xl" style={{ background: item.color }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-3.5 w-3.5" style={{ color: item.iconColor }} />
                      <span className="text-xs font-bold" style={{ color: "var(--text)" }}>{item.rol}</span>
                    </div>
                    <ul className="space-y-0.5">
                      {item.permisos.map(p => (
                        <li key={p} className="text-[11px] flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                          <span style={{ color: "var(--primary)" }}>•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aviso */}
          <div className="rounded-2xl p-5" style={{ background: "rgba(244,183,64,0.08)", border: "1px solid rgba(244,183,64,0.30)" }}>
            <p className="text-xs font-bold mb-1.5" style={{ color: "#b08000" }}>⚠ Consideraciones</p>
            <ul className="space-y-1.5">
              {[
                "Solo los administradores pueden acceder a esta página.",
                "El RUT es único en el sistema; no puede repetirse.",
                "El empleado debe cambiar su contraseña en el primer ingreso.",
              ].map(t => (
                <li key={t} className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
