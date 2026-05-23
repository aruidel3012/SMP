import type { Service, Contract } from "../../types";

type ClientContractsProps = {
  services: Service[];
  contracts: Contract[];
  equipmentByService: Record<string, number>;
  setEquipmentByService: (v: Record<string, number>) => void;
  handleContract: (service: Service) => void;
  handleContractUpdate: (contractId: string, patch: { equipmentCount?: number; status?: "active" | "paused" | "cancelled" }) => void;
};

export function ClientContracts({
  services,
  contracts,
  equipmentByService,
  setEquipmentByService,
  handleContract,
  handleContractUpdate,
}: ClientContractsProps) {
  return (
    <div className="client-grid-2">
      <div className="client-card">
        <h3>Servicios adicionales</h3>
        <div className="client-services-list">
          {services.map((service) => (
            <div key={service.id} className="client-service-item">
              <div className="client-service-item__body">
                <p className="client-service-item__name">{service.name}</p>
                <p className="client-service-item__desc">
                  {service.description}
                </p>
                <p className="client-service-item__price">{service.price}</p>
              </div>
              <div className="client-contract-controls">
                <label>Equipos</label>
                <input
                  type="number"
                  min={1}
                  value={equipmentByService[service.id] || 1}
                  onChange={(e) =>
                    setEquipmentByService({
                      ...equipmentByService,
                      [service.id]: Math.max(
                        1,
                        Number(e.target.value || 1),
                      ),
                    })
                  }
                />
                <button
                  className="client-btn client-btn--primary client-btn--sm"
                  onClick={() => handleContract(service)}
                >
                  Contratar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="client-card">
        <h3>Contratos activos</h3>
        <div className="client-contracts-list">
          {contracts.filter(c => c.status !== 'cancelled').length === 0 && (
            <p className="client-empty">Sin contratos activos.</p>
          )}
          {contracts.filter(c => c.status !== 'cancelled').map((contract) => (
            <div
              key={contract._id}
              className="client-contract-item"
            >
              <div className="client-timeline-dot blue" />
              <div className="client-contract-item__info">
                <p>{contract.serviceName}</p>
                <span>
                  {contract.status} · {contract.equipmentCount}{" "}
                  equipos ·{" "}
                  {new Date(contract.updatedAt).toLocaleDateString(
                    "es-ES",
                  )}
                </span>
              </div>
              <div className="client-contract-item__actions">
                <input
                  type="number"
                  min={1}
                  defaultValue={contract.equipmentCount}
                  onBlur={(e) =>
                    handleContractUpdate(contract._id, {
                      equipmentCount: Math.max(
                        1,
                        Number(e.target.value || 1),
                      ),
                    })
                  }
                />
                <button
                  className="client-btn client-btn--sm"
                  onClick={() =>
                    handleContractUpdate(contract._id, {
                      status: "paused",
                    })
                  }
                >
                  Pausar
                </button>
                <button
                  className="client-btn client-btn--sm"
                  onClick={() =>
                    handleContractUpdate(contract._id, {
                      status: "cancelled",
                    })
                  }
                >
                  Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
