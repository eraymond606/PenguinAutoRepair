import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../components/layout/StaffLayout";
import styles from "./StaffCustomers.module.css";

const DUMMY_CUSTOMERS = [
  {
    id: 1,
    firstName: "Jane",
    lastName: "Doe",
    street: "123 Main Street",
    city: "Springfield",
    state: "IL",
    zip: "62701",
    phone: "(555) 123-4567",
    email: "jane.doe@email.com",
    vehicles: [
      {
        id: 1,
        year: 2018,
        make: "Honda",
        model: "Accord",
        color: "Silver",
        plate: "ABC-1234"
      },
      {
        id: 2,
        year: 2020,
        make: "Honda",
        model: "CR-V",
        color: "Blue",
        plate: "XYZ-5678"
      }
    ],
    repairs: [
      {
        id: "R-1001",
        date: "2025-11-28",
        vehicle: "2018 Honda Accord",
        service: "Oil Change & Filter",
        status: "completed"
      },
      {
        id: "R-1002",
        date: "2025-11-15",
        vehicle: "2020 Honda CR-V",
        service: "Brake Pad Replacement",
        status: "completed"
      },
      {
        id: "R-1003",
        date: "2025-10-20",
        vehicle: "2018 Honda Accord",
        service: "Tire Rotation",
        status: "completed"
      }
    ],
    invoices: [
      {
        id: "INV-2001",
        date: "2025-11-28",
        total: "$89.99",
        status: "paid"
      },
      {
        id: "INV-2002",
        date: "2025-11-15",
        total: "$245.00",
        status: "paid"
      },
      {
        id: "INV-2003",
        date: "2025-10-20",
        total: "$45.00",
        status: "paid"
      }
    ]
  },
  {
    id: 2,
    firstName: "John",
    lastName: "Smith",
    street: "456 Oak Avenue",
    city: "Portland",
    state: "OR",
    zip: "97201",
    phone: "(555) 234-5678",
    email: "john.smith@email.com",
    vehicles: [
      {
        id: 3,
        year: 2020,
        make: "Toyota",
        model: "Camry",
        color: "Black",
        plate: "DEF-9012"
      }
    ],
    repairs: [
      {
        id: "R-1004",
        date: "2025-11-25",
        vehicle: "2020 Toyota Camry",
        service: "Engine Diagnostics",
        status: "in_progress"
      },
      {
        id: "R-1005",
        date: "2025-10-10",
        vehicle: "2020 Toyota Camry",
        service: "Air Filter Replacement",
        status: "completed"
      }
    ],
    invoices: [
      {
        id: "INV-2004",
        date: "2025-11-25",
        total: "$150.00",
        status: "pending"
      },
      {
        id: "INV-2005",
        date: "2025-10-10",
        total: "$65.00",
        status: "paid"
      }
    ]
  },
  {
    id: 3,
    firstName: "Mike",
    lastName: "Wilson",
    street: "789 Pine Road",
    city: "Austin",
    state: "TX",
    zip: "78701",
    phone: "(555) 345-6789",
    email: "mike.wilson@email.com",
    vehicles: [
      {
        id: 4,
        year: 2019,
        make: "Ford",
        model: "F-150",
        color: "Red",
        plate: "GHI-3456"
      }
    ],
    repairs: [
      {
        id: "R-1006",
        date: "2025-11-20",
        vehicle: "2019 Ford F-150",
        service: "Transmission Service",
        status: "completed"
      }
    ],
    invoices: [
      {
        id: "INV-2006",
        date: "2025-11-20",
        total: "$320.00",
        status: "paid"
      }
    ]
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Brown",
    street: "321 Elm Street",
    city: "Seattle",
    state: "WA",
    zip: "98101",
    phone: "(555) 456-7890",
    email: "emily.brown@email.com",
    vehicles: [
      {
        id: 5,
        year: 2021,
        make: "Nissan",
        model: "Altima",
        color: "White",
        plate: "JKL-7890"
      },
      {
        id: 6,
        year: 2019,
        make: "Nissan",
        model: "Rogue",
        color: "Gray",
        plate: "MNO-2345"
      }
    ],
    repairs: [
      {
        id: "R-1007",
        date: "2025-11-29",
        vehicle: "2021 Nissan Altima",
        service: "Battery Replacement",
        status: "scheduled"
      },
      {
        id: "R-1008",
        date: "2025-11-10",
        vehicle: "2019 Nissan Rogue",
        service: "Full Service Inspection",
        status: "completed"
      }
    ],
    invoices: [
      {
        id: "INV-2007",
        date: "2025-11-29",
        total: "$185.00",
        status: "pending"
      },
      {
        id: "INV-2008",
        date: "2025-11-10",
        total: "$275.00",
        status: "paid"
      }
    ]
  },
  {
    id: 5,
    firstName: "David",
    lastName: "Lee",
    street: "555 Maple Drive",
    city: "Denver",
    state: "CO",
    zip: "80201",
    phone: "(555) 567-8901",
    email: "david.lee@email.com",
    vehicles: [
      {
        id: 7,
        year: 2017,
        make: "Chevrolet",
        model: "Malibu",
        color: "Blue",
        plate: "PQR-6789"
      }
    ],
    repairs: [
      {
        id: "R-1009",
        date: "2025-11-18",
        vehicle: "2017 Chevrolet Malibu",
        service: "Brake Inspection",
        status: "completed"
      },
      {
        id: "R-1010",
        date: "2025-09-25",
        vehicle: "2017 Chevrolet Malibu",
        service: "Oil Change",
        status: "completed"
      }
    ],
    invoices: [
      {
        id: "INV-2009",
        date: "2025-11-18",
        total: "$125.00",
        status: "paid"
      },
      {
        id: "INV-2010",
        date: "2025-09-25",
        total: "$79.99",
        status: "paid"
      }
    ]
  },
  {
    id: 6,
    firstName: "Sarah",
    lastName: "Johnson",
    street: "888 Cedar Lane",
    city: "Miami",
    state: "FL",
    zip: "33101",
    phone: "(555) 678-9012",
    email: "sarah.johnson@email.com",
    vehicles: [
      {
        id: 8,
        year: 2022,
        make: "Tesla",
        model: "Model 3",
        color: "Black",
        plate: "STU-1234"
      }
    ],
    repairs: [
      {
        id: "R-1011",
        date: "2025-11-22",
        vehicle: "2022 Tesla Model 3",
        service: "Software Update & Inspection",
        status: "completed"
      }
    ],
    invoices: [
      {
        id: "INV-2011",
        date: "2025-11-22",
        total: "$95.00",
        status: "paid"
      }
    ]
  },
  {
    id: 7,
    firstName: "Robert",
    lastName: "Taylor",
    street: "999 Birch Boulevard",
    city: "Boston",
    state: "MA",
    zip: "02101",
    phone: "(555) 789-0123",
    email: "robert.taylor@email.com",
    vehicles: [
      {
        id: 9,
        year: 2018,
        make: "BMW",
        model: "X5",
        color: "White",
        plate: "VWX-5678"
      }
    ],
    repairs: [
      {
        id: "R-1012",
        date: "2025-11-27",
        vehicle: "2018 BMW X5",
        service: "Suspension Check",
        status: "in_progress"
      },
      {
        id: "R-1013",
        date: "2025-10-15",
        vehicle: "2018 BMW X5",
        service: "Oil Change & Inspection",
        status: "completed"
      }
    ],
    invoices: [
      {
        id: "INV-2012",
        date: "2025-11-27",
        total: "$425.00",
        status: "pending"
      },
      {
        id: "INV-2013",
        date: "2025-10-15",
        total: "$195.00",
        status: "paid"
      }
    ]
  },
  {
    id: 8,
    firstName: "Lisa",
    lastName: "Anderson",
    street: "777 Willow Way",
    city: "Phoenix",
    state: "AZ",
    zip: "85001",
    phone: "(555) 890-1234",
    email: "lisa.anderson@email.com",
    vehicles: [
      {
        id: 10,
        year: 2020,
        make: "Subaru",
        model: "Outback",
        color: "Green",
        plate: "YZA-9012"
      }
    ],
    repairs: [
      {
        id: "R-1014",
        date: "2025-11-26",
        vehicle: "2020 Subaru Outback",
        service: "Tire Replacement (All Four)",
        status: "completed"
      },
      {
        id: "R-1015",
        date: "2025-10-05",
        vehicle: "2020 Subaru Outback",
        service: "AC System Check",
        status: "completed"
      }
    ],
    invoices: [
      {
        id: "INV-2014",
        date: "2025-11-26",
        total: "$680.00",
        status: "paid"
      },
      {
        id: "INV-2015",
        date: "2025-10-05",
        total: "$145.00",
        status: "paid"
      }
    ]
  }
];

export default function StaffCustomers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(DUMMY_CUSTOMERS[0].id);

  // Filter customers based on search query
  const filteredCustomers = DUMMY_CUSTOMERS.filter(customer => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Get the selected customer
  const selectedCustomer = DUMMY_CUSTOMERS.find(c => c.id === selectedCustomerId);

  return (
    <StaffLayout>
      <div className={styles.customersContainer}>
        <button 
          className={styles.backLink}
          onClick={() => navigate("/staff")}
        >
          ← Back to Dashboard
        </button>
        
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Customers & Vehicles</h1>
          <p className={styles.subtitle}>View customer records and their vehicles</p>
        </div>

        <div className={styles.contentCard}>
          {/* Left Column: Customer List */}
          <div className={styles.customerList}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.listWrapper}>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`${styles.customerRow} ${selectedCustomerId === customer.id ? styles.selected : ''}`}
                    onClick={() => setSelectedCustomerId(customer.id)}
                  >
                    <div className={styles.customerName}>
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className={styles.customerEmail}>{customer.email}</div>
                    <div className={styles.vehicleCount}>
                      {customer.vehicles.length} vehicle{customer.vehicles.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>No customers found</div>
              )}
            </div>
          </div>

          {/* Right Column: Customer Details */}
          <div className={styles.customerDetails}>
            {selectedCustomer ? (
              <>
                <h2 className={styles.sectionTitle}>Customer Details</h2>
                
                <div className={styles.detailsSection}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Name:</span>
                    <span className={styles.detailValue}>
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Address:</span>
                    <span className={styles.detailValue}>
                      {selectedCustomer.street}, {selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.zip}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Phone:</span>
                    <span className={styles.detailValue}>{selectedCustomer.phone}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>{selectedCustomer.email}</span>
                  </div>
                </div>

                <h3 className={styles.subsectionTitle}>Vehicles</h3>
                
                <div className={styles.vehiclesGrid}>
                  {selectedCustomer.vehicles.map((vehicle) => (
                    <div key={vehicle.id} className={styles.vehicleCard}>
                      <div className={styles.vehicleHeader}>
                        <span className={styles.vehicleYear}>{vehicle.year}</span>
                        <span className={styles.vehicleMake}>{vehicle.make} {vehicle.model}</span>
                      </div>
                      <div className={styles.vehicleInfo}>
                        <div className={styles.vehicleDetail}>
                          <span className={styles.vehicleLabel}>Color:</span>
                          <span>{vehicle.color}</span>
                        </div>
                        <div className={styles.vehicleDetail}>
                          <span className={styles.vehicleLabel}>Plate:</span>
                          <span className={styles.vehiclePlate}>{vehicle.plate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className={styles.subsectionTitle}>Recent Repairs</h3>
                
                <div className={styles.historySection}>
                  {selectedCustomer.repairs.length > 0 ? (
                    <div className={styles.historyTable}>
                      <div className={styles.tableHeader}>
                        <div className={styles.tableCell}>Repair ID</div>
                        <div className={styles.tableCell}>Date</div>
                        <div className={styles.tableCell}>Vehicle</div>
                        <div className={styles.tableCell}>Service</div>
                        <div className={styles.tableCell}>Status</div>
                      </div>
                      {selectedCustomer.repairs.map((repair) => (
                        <div key={repair.id} className={styles.tableRow}>
                          <div className={styles.tableCell}>
                            <strong>{repair.id}</strong>
                          </div>
                          <div className={styles.tableCell}>{repair.date}</div>
                          <div className={styles.tableCell}>{repair.vehicle}</div>
                          <div className={styles.tableCell}>{repair.service}</div>
                          <div className={styles.tableCell}>
                            <span className={`${styles.statusBadge} ${styles[repair.status]}`}>
                              {repair.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.noData}>No repair history</div>
                  )}
                </div>

                <h3 className={styles.subsectionTitle}>Recent Invoices</h3>
                
                <div className={styles.historySection}>
                  {selectedCustomer.invoices.length > 0 ? (
                    <div className={styles.historyTable}>
                      <div className={styles.tableHeader}>
                        <div className={styles.tableCell}>Invoice ID</div>
                        <div className={styles.tableCell}>Date</div>
                        <div className={styles.tableCell}>Total</div>
                        <div className={styles.tableCell}>Status</div>
                      </div>
                      {selectedCustomer.invoices.map((invoice) => (
                        <div key={invoice.id} className={styles.tableRow}>
                          <div className={styles.tableCell}>
                            <strong>{invoice.id}</strong>
                          </div>
                          <div className={styles.tableCell}>{invoice.date}</div>
                          <div className={styles.tableCell}>
                            <strong className={styles.totalAmount}>{invoice.total}</strong>
                          </div>
                          <div className={styles.tableCell}>
                            <span className={`${styles.statusBadge} ${styles[invoice.status]}`}>
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.noData}>No invoice history</div>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.noSelection}>
                <p>Select a customer to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
