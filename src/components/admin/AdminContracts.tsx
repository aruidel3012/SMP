import type { Contract } from "../../types";

type AdminContractsProps = {
  contracts: Contract[];
};

export function AdminContracts({ contracts }: AdminContractsProps) {
  return (
    <div className="admin-contracts-grid">
      <div className="admin-contracts-card">
        <h3>Contrataciones de clientes</h3>
        <div className="admin-timeline-list">
          {contracts.map((contract) => (
            <div key={contract._id} className="admin-timeline-item">
              <div className="admin-timeline-dot blue" />
              <div>
                <p>{contract.serviceName}</p>
                <span>{contract.clientEmail} · {contract.equipmentCount} equipos · {contract.status}</span>
              </div>
            </div>
          ))}
          {contracts.length === 0 && <p className="admin-empty">Sin contrataciones registradas.</p>}
        </div>
      </div>
    </div>
  );
}
