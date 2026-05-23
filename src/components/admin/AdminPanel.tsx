import { SUBSCRIPTION_PLANS } from "../../data/plans";
import type { RegisteredUser, Service } from "../../types";

type AdminPanelProps = {
  registeredUsers: RegisteredUser[];
  services: Service[];
  adminSelectedEmail: string;
  setAdminSelectedEmail: (v: string) => void;
  adminSelectedPlanId: string;
  setAdminSelectedPlanId: (v: string) => void;
  adminSelectedServiceId: string;
  setAdminSelectedServiceId: (v: string) => void;
  adminEquipmentCount: number;
  setAdminEquipmentCount: (v: number) => void;
  adminAssignLoading: boolean;
  handleAdminAssignPlan: () => void;
  handleAdminAssignService: () => void;
};

export function AdminPanel({
  registeredUsers,
  services,
  adminSelectedEmail,
  setAdminSelectedEmail,
  adminSelectedPlanId,
  setAdminSelectedPlanId,
  adminSelectedServiceId,
  setAdminSelectedServiceId,
  adminEquipmentCount,
  setAdminEquipmentCount,
  adminAssignLoading,
  handleAdminAssignPlan,
  handleAdminAssignService,
}: AdminPanelProps) {
  return (
    <div className="admin-grid">
      <div className="admin-card">
        <div className="admin-card__header">
          <h3>Asignar suscripcion</h3>
        </div>
        <div className="admin-management-form">
          <label>
            Usuario registrado
            <select
              value={adminSelectedEmail}
              onChange={(event) => setAdminSelectedEmail(event.target.value)}
            >
              {registeredUsers.map((user) => (
                <option key={user._id} value={user.email}>
                  {user.name || user.email} - {user.email}
                </option>
              ))}
            </select>
          </label>
          <label>
            Suscripcion posible
            <select
              value={adminSelectedPlanId}
              onChange={(event) => setAdminSelectedPlanId(event.target.value)}
            >
              {SUBSCRIPTION_PLANS.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.price} EUR/{plan.period}
                </option>
              ))}
            </select>
          </label>
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleAdminAssignPlan}
            disabled={adminAssignLoading || registeredUsers.length === 0}
            type="button"
          >
            Asignar suscripcion
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card__header">
          <h3>Asignar servicio</h3>
        </div>
        <div className="admin-management-form">
          <label>
            Usuario registrado
            <select
              value={adminSelectedEmail}
              onChange={(event) => setAdminSelectedEmail(event.target.value)}
            >
              {registeredUsers.map((user) => (
                <option key={user._id} value={user.email}>
                  {user.name || user.email} - {user.email}
                </option>
              ))}
            </select>
          </label>
          <label>
            Servicio posible
            <select
              value={adminSelectedServiceId}
              onChange={(event) => setAdminSelectedServiceId(event.target.value)}
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.price}
                </option>
              ))}
            </select>
          </label>
          <label>
            Equipos
            <input
              type="number"
              min={1}
              value={adminEquipmentCount}
              onChange={(event) =>
                setAdminEquipmentCount(Math.max(1, Number(event.target.value || 1)))
              }
            />
          </label>
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleAdminAssignService}
            disabled={
              adminAssignLoading ||
              registeredUsers.length === 0 ||
              services.length === 0
            }
            type="button"
          >
            Asignar servicio
          </button>
        </div>
      </div>
    </div>
  );
}
