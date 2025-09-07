export const mockManagers = [
  { id: "ENG001", name: "Alice Johnson", department: "Engineering" },
  { id: "ENG002", name: "Tanvir Ahamed", department: "Engineering" },
  { id: "ENG003", name: "Lisa Wong", department: "Engineering" },
  { id: "MKT001", name: "Sarah Kim", department: "Marketing" },
  { id: "MKT002", name: "John Patel", department: "Marketing" },
  { id: "MKT003", name: "Nina Roy", department: "Marketing" },
  { id: "SAL001", name: "David Lee", department: "Sales" },
  { id: "SAL002", name: "Maria Gomez", department: "Sales" },
  { id: "SAL003", name: "Rahul Sinha", department: "Sales" },
  { id: "HR001", name: "Emma Brown", department: "HR" },
  { id: "HR002", name: "Hasan Chowdhury", department: "HR" },
  { id: "FIN001", name: "Olivia Green", department: "Finance" },
  { id: "FIN002", name: "Jake Turner", department: "Finance" },
  { id: "FIN003", name: "Nadia Rahman", department: "Finance" },
];

export const skillsByDepartment = {
  Engineering: [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "GraphQL",
    "Docker",
    "CI/CD",
    "Microservices",
    "Unit Testing",
  ],
  Marketing: [
    "SEO",
    "Content Writing",
    "Google Ads",
    "Social Media Marketing",
    "Email Marketing",
    "Brand Management",
    "Copywriting",
    "Video Editing",
  ],
  Sales: [
    "CRM Software",
    "Lead Generation",
    "Cold Calling",
    "Upselling",
    "Negotiation",
    "Client Relationship Management",
    "B2B Sales",
    "Territory Management",
  ],
  HR: [
    "Recruitment",
    "Onboarding",
    "Conflict Resolution",
    "Payroll Management",
    "Compliance",
    "Employee Training",
    "Performance Review",
  ],
  Finance: [
    "Budgeting",
    "Financial Analysis",
    "Accounting",
    "Bookkeeping",
    "Payroll Processing",
    "Tax Compliance",
    "Expense Reporting",
    "Cash Flow Management",
  ],
};

export const departments = ["Engineering", "Marketing", "Sales", "HR", "Finance"];

export const jobTypes = ["Full-time", "Part-time", "Contract"];

export const relationships = ["Parent", "Spouse", "Sibling", "Child", "Friend", "Other"];

export const weekendRestrictedDepartments = ["HR", "Finance"];

export const allowedImageTypes = ["image/jpeg", "image/png"];
export const getManagersByDepartment = (department) => {
  return mockManagers.filter((manager) => manager.department === department);
};

export const getSkillsByDepartment = (department) => {
  return skillsByDepartment[department] || [];
};
