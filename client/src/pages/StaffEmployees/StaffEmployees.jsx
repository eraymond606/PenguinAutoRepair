import React from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../components/layout/StaffLayout";
import styles from "./StaffEmployees.module.css";

const DUMMY_EMPLOYEES = [
  {
    id: 1,
    firstName: "Alex",
    lastName: "Smith",
    street: "123 Mechanic Lane",
    city: "Springfield",
    zip: "62701",
    email: "alex.smith@penguinauto.com",
    phone: "(555) 101-2001",
    position: "Senior Technician",
    hourlyWage: 32.50,
    hireDate: "2020-03-15",
    assignedTasks: "5 appointments today"
  },
  {
    id: 2,
    firstName: "Sarah",
    lastName: "Johnson",
    street: "456 Oak Avenue",
    city: "Portland",
    zip: "97201",
    email: "sarah.johnson@penguinauto.com",
    phone: "(555) 102-2002",
    position: "Lead Technician",
    hourlyWage: 35.00,
    hireDate: "2019-07-22",
    assignedTasks: "4 appointments today"
  },
  {
    id: 3,
    firstName: "Mike",
    lastName: "Davis",
    street: "789 Pine Road",
    city: "Austin",
    zip: "78701",
    email: "mike.davis@penguinauto.com",
    phone: "(555) 103-2003",
    position: "Technician",
    hourlyWage: 28.00,
    hireDate: "2021-01-10",
    assignedTasks: "3 appointments today"
  },
  {
    id: 4,
    firstName: "Jessica",
    lastName: "Martinez",
    street: "321 Elm Street",
    city: "Seattle",
    zip: "98101",
    email: "jessica.martinez@penguinauto.com",
    phone: "(555) 104-2004",
    position: "Technician",
    hourlyWage: 27.50,
    hireDate: "2021-06-18",
    assignedTasks: "2 appointments today"
  },
  {
    id: 5,
    firstName: "Robert",
    lastName: "Williams",
    street: "555 Maple Drive",
    city: "Denver",
    zip: "80201",
    email: "robert.williams@penguinauto.com",
    phone: "(555) 105-2005",
    position: "Service Advisor",
    hourlyWage: 25.00,
    hireDate: "2022-02-01",
    assignedTasks: "8 customer consultations"
  },
  {
    id: 6,
    firstName: "Emily",
    lastName: "Brown",
    street: "888 Cedar Lane",
    city: "Miami",
    zip: "33101",
    email: "emily.brown@penguinauto.com",
    phone: "(555) 106-2006",
    position: "Parts Manager",
    hourlyWage: 30.00,
    hireDate: "2020-09-12",
    assignedTasks: "12 inventory items to order"
  },
  {
    id: 7,
    firstName: "David",
    lastName: "Taylor",
    street: "999 Birch Boulevard",
    city: "Boston",
    zip: "02101",
    email: "david.taylor@penguinauto.com",
    phone: "(555) 107-2007",
    position: "Shop Manager",
    hourlyWage: 38.00,
    hireDate: "2018-05-20",
    assignedTasks: "Overseeing 4 technicians"
  },
  {
    id: 8,
    firstName: "Lisa",
    lastName: "Anderson",
    street: "777 Willow Way",
    city: "Phoenix",
    zip: "85001",
    email: "lisa.anderson@penguinauto.com",
    phone: "(555) 108-2008",
    position: "Receptionist",
    hourlyWage: 18.50,
    hireDate: "2023-01-15",
    assignedTasks: "Front desk management"
  },
  {
    id: 9,
    firstName: "James",
    lastName: "Garcia",
    street: "444 Spruce Street",
    city: "Chicago",
    zip: "60601",
    email: "james.garcia@penguinauto.com",
    phone: "(555) 109-2009",
    position: "Diesel Specialist",
    hourlyWage: 36.00,
    hireDate: "2019-11-08",
    assignedTasks: "2 appointments today"
  },
  {
    id: 10,
    firstName: "Maria",
    lastName: "Rodriguez",
    street: "222 Ash Avenue",
    city: "San Diego",
    zip: "92101",
    email: "maria.rodriguez@penguinauto.com",
    phone: "(555) 110-2010",
    position: "Detailing Specialist",
    hourlyWage: 22.00,
    hireDate: "2022-08-25",
    assignedTasks: "3 vehicles scheduled"
  }
];

export default function StaffEmployees() {
  const navigate = useNavigate();

  return (
    <StaffLayout>
      <div className={styles.employeesContainer}>
        <button 
          className={styles.backLink}
          onClick={() => navigate("/staff")}
        >
          ← Back to Dashboard
        </button>

        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Employees</h1>
          <p className={styles.subtitle}>Manage technicians and staff</p>
        </div>

        <div className={styles.contentCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.employeesTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Zip</th>
                  <th>Hourly Wage</th>
                  <th>Hire Date</th>
                  <th>Assigned Tasks</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_EMPLOYEES.map((employee) => (
                  <tr key={employee.id}>
                    <td className={styles.nameCell}>
                      <strong>{employee.firstName} {employee.lastName}</strong>
                    </td>
                    <td className={styles.positionCell}>{employee.position}</td>
                    <td>{employee.phone}</td>
                    <td className={styles.emailCell}>{employee.email}</td>
                    <td>{employee.street}, {employee.city}</td>
                    <td>{employee.zip}</td>
                    <td className={styles.wageCell}>${employee.hourlyWage.toFixed(2)}/hr</td>
                    <td>{employee.hireDate}</td>
                    <td className={styles.tasksCell}>{employee.assignedTasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.summaryBar}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Employees:</span>
              <span className={styles.summaryValue}>{DUMMY_EMPLOYEES.length}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Technicians:</span>
              <span className={styles.summaryValue}>
                {DUMMY_EMPLOYEES.filter(e => e.position.includes('Technician')).length}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Staff:</span>
              <span className={styles.summaryValue}>
                {DUMMY_EMPLOYEES.filter(e => !e.position.includes('Technician')).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
