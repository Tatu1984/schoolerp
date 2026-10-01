const { createCanvas } = require("canvas");
const fs = require("fs");

// ==================== 1. DATA FLOW DIAGRAM ====================
function createDataFlowDiagram() {
  const width = 1200;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Colors
  const primaryBlue = "#1a56db";
  const lightBlue = "#dbeafe";
  const darkGray = "#374151";
  const mediumGray = "#6b7280";
  const green = "#059669";
  const orange = "#d97706";
  const purple = "#7c3aed";

  // Helper function to draw rounded rectangle
  function roundedRect(x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Helper function to draw arrow
  function drawArrow(fromX, fromY, toX, toY, color, bidirectional = false) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    // Draw line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Calculate arrow head
    const headlen = 12;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Draw arrow head at end
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headlen * Math.cos(angle - Math.PI / 6),
      toY - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toX - headlen * Math.cos(angle + Math.PI / 6),
      toY - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    // Draw arrow head at start if bidirectional
    if (bidirectional) {
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(
        fromX + headlen * Math.cos(angle - Math.PI / 6),
        fromY + headlen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        fromX + headlen * Math.cos(angle + Math.PI / 6),
        fromY + headlen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    }
  }

  // Title
  ctx.fillStyle = darkGray;
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "center";
  ctx.fillText("School ERP System - High-Level Data Flow", width / 2, 40);

  // Main components - Row 1
  const boxWidth = 180;
  const boxHeight = 100;
  const startY = 100;

  // Web Browser
  roundedRect(100, startY, boxWidth, boxHeight, 10, lightBlue, primaryBlue);
  ctx.fillStyle = darkGray;
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Web Browser", 100 + boxWidth / 2, startY + 35);
  ctx.font = "14px Arial";
  ctx.fillStyle = mediumGray;
  ctx.fillText("(Frontend)", 100 + boxWidth / 2, startY + 55);
  ctx.fillText("React/Next.js", 100 + boxWidth / 2, startY + 75);

  // Next.js App
  roundedRect(500, startY, boxWidth, boxHeight, 10, "#dcfce7", green);
  ctx.fillStyle = darkGray;
  ctx.font = "bold 16px Arial";
  ctx.fillText("Next.js App", 500 + boxWidth / 2, startY + 35);
  ctx.font = "14px Arial";
  ctx.fillStyle = mediumGray;
  ctx.fillText("(Backend)", 500 + boxWidth / 2, startY + 55);
  ctx.fillText("API Routes", 500 + boxWidth / 2, startY + 75);

  // PostgreSQL
  roundedRect(900, startY, boxWidth, boxHeight, 10, "#fef3c7", orange);
  ctx.fillStyle = darkGray;
  ctx.font = "bold 16px Arial";
  ctx.fillText("PostgreSQL", 900 + boxWidth / 2, startY + 35);
  ctx.font = "14px Arial";
  ctx.fillStyle = mediumGray;
  ctx.fillText("(Database)", 900 + boxWidth / 2, startY + 55);
  ctx.fillText("Prisma ORM", 900 + boxWidth / 2, startY + 75);

  // Arrows between main components
  drawArrow(280, startY + 50, 500, startY + 50, primaryBlue, true);
  drawArrow(680, startY + 50, 900, startY + 50, green, true);

  // Labels on arrows
  ctx.fillStyle = mediumGray;
  ctx.font = "12px Arial";
  ctx.fillText("HTTP/REST", 390, startY + 40);
  ctx.fillText("Queries", 790, startY + 40);

  // Row 2 - Supporting services
  const row2Y = 280;

  // NextAuth
  roundedRect(150, row2Y, 150, 80, 10, "#ede9fe", purple);
  ctx.fillStyle = darkGray;
  ctx.font = "bold 14px Arial";
  ctx.fillText("NextAuth.js", 150 + 75, row2Y + 30);
  ctx.font = "12px Arial";
  ctx.fillStyle = mediumGray;
  ctx.fillText("Authentication", 150 + 75, row2Y + 50);
  ctx.fillText("JWT Sessions", 150 + 75, row2Y + 65);

  // Middleware
  roundedRect(450, row2Y, 150, 80, 10, "#fce7f3", "#db2777");
  ctx.fillStyle = darkGray;
  ctx.font = "bold 14px Arial";
  ctx.fillText("Middleware", 450 + 75, row2Y + 30);
  ctx.font = "12px Arial";
  ctx.fillStyle = mediumGray;
  ctx.fillText("Auth & RBAC", 450 + 75, row2Y + 50);
  ctx.fillText("Validation", 450 + 75, row2Y + 65);

  // Prisma ORM
  roundedRect(700, row2Y, 150, 80, 10, "#ccfbf1", "#0d9488");
  ctx.fillStyle = darkGray;
  ctx.font = "bold 14px Arial";
  ctx.fillText("Prisma ORM", 700 + 75, row2Y + 30);
  ctx.font = "12px Arial";
  ctx.fillStyle = mediumGray;
  ctx.fillText("Query Builder", 700 + 75, row2Y + 50);
  ctx.fillText("Migrations", 700 + 75, row2Y + 65);

  // Audit Log
  roundedRect(950, row2Y, 150, 80, 10, "#fee2e2", "#dc2626");
  ctx.fillStyle = darkGray;
  ctx.font = "bold 14px Arial";
  ctx.fillText("Audit System", 950 + 75, row2Y + 30);
  ctx.font = "12px Arial";
  ctx.fillStyle = mediumGray;
  ctx.fillText("Activity Logging", 950 + 75, row2Y + 50);
  ctx.fillText("Compliance", 950 + 75, row2Y + 65);

  // Vertical arrows from row 1 to row 2
  drawArrow(190, startY + boxHeight, 225, row2Y, purple);
  drawArrow(590, startY + boxHeight, 525, row2Y, "#db2777");
  drawArrow(590, startY + boxHeight, 775, row2Y, "#0d9488");
  drawArrow(990, startY + boxHeight, 1025, row2Y, "#dc2626");

  // Row 3 - Modules
  const row3Y = 440;
  ctx.fillStyle = darkGray;
  ctx.font = "bold 18px Arial";
  ctx.fillText("Application Modules", width / 2, row3Y);

  const modules = [
    { name: "Students", color: "#3b82f6" },
    { name: "Staff", color: "#8b5cf6" },
    { name: "Finance", color: "#10b981" },
    { name: "Transport", color: "#f59e0b" },
    { name: "LMS", color: "#ef4444" },
    { name: "Library", color: "#06b6d4" },
    { name: "Hostel", color: "#ec4899" },
    { name: "Canteen", color: "#84cc16" },
  ];

  const moduleWidth = 120;
  const moduleHeight = 60;
  const moduleStartX = 80;
  const moduleY = row3Y + 30;
  const moduleGap = 130;

  modules.forEach((module, i) => {
    const x = moduleStartX + i * moduleGap;
    roundedRect(x, moduleY, moduleWidth, moduleHeight, 8, module.color + "20", module.color);
    ctx.fillStyle = darkGray;
    ctx.font = "bold 13px Arial";
    ctx.fillText(module.name, x + moduleWidth / 2, moduleY + 35);
  });

  // Row 4 - Users
  const row4Y = 600;
  ctx.fillStyle = darkGray;
  ctx.font = "bold 18px Arial";
  ctx.fillText("User Roles", width / 2, row4Y);

  const users = [
    { name: "Super Admin", icon: "👑" },
    { name: "School Admin", icon: "🏫" },
    { name: "Principal", icon: "👔" },
    { name: "Teacher", icon: "👨‍🏫" },
    { name: "Accountant", icon: "💰" },
    { name: "Student", icon: "👨‍🎓" },
    { name: "Parent", icon: "👪" },
  ];

  const userWidth = 130;
  const userHeight = 50;
  const userStartX = 100;
  const userY = row4Y + 30;
  const userGap = 145;

  users.forEach((user, i) => {
    const x = userStartX + i * userGap;
    roundedRect(x, userY, userWidth, userHeight, 8, "#f3f4f6", "#9ca3af");
    ctx.fillStyle = darkGray;
    ctx.font = "13px Arial";
    ctx.fillText(user.icon + " " + user.name, x + userWidth / 2, userY + 30);
  });

  // Connecting lines from users to browser
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(190, startY + boxHeight);
  ctx.lineTo(190, row4Y + 80);
  ctx.lineTo(width - 190, row4Y + 80);
  ctx.lineTo(width - 190, row4Y + 30);
  ctx.stroke();
  ctx.setLineDash([]);

  // Legend
  const legendY = 720;
  ctx.fillStyle = darkGray;
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Legend:", 80, legendY);

  const legendItems = [
    { color: primaryBlue, label: "Frontend Layer" },
    { color: green, label: "Backend Layer" },
    { color: orange, label: "Data Layer" },
    { color: purple, label: "Security Layer" },
  ];

  legendItems.forEach((item, i) => {
    const x = 150 + i * 200;
    ctx.fillStyle = item.color;
    ctx.fillRect(x, legendY - 12, 16, 16);
    ctx.fillStyle = mediumGray;
    ctx.font = "12px Arial";
    ctx.fillText(item.label, x + 22, legendY);
  });

  // Save
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync("data-flow-diagram.png", buffer);
  console.log("Created: data-flow-diagram.png");
}

// ==================== 2. DIRECTORY STRUCTURE DIAGRAM ====================
function createDirectoryDiagram() {
  const width = 900;
  const height = 1100;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Colors
  const folderColor = "#fbbf24";
  const fileColor = "#60a5fa";
  const darkGray = "#374151";
  const mediumGray = "#6b7280";
  const lightGray = "#f3f4f6";

  // Title
  ctx.fillStyle = darkGray;
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Project Directory Structure", width / 2, 40);

  // Directory tree
  const tree = [
    { level: 0, name: "edu/", type: "folder", desc: "Project Root" },
    { level: 1, name: "app/", type: "folder", desc: "Next.js App Directory" },
    { level: 2, name: "api/", type: "folder", desc: "210+ API Routes" },
    { level: 3, name: "auth/", type: "folder", desc: "Authentication" },
    { level: 3, name: "schools/", type: "folder", desc: "School Management" },
    { level: 3, name: "students/", type: "folder", desc: "Student APIs" },
    { level: 3, name: "staff/", type: "folder", desc: "Staff Management" },
    { level: 3, name: "admissions/", type: "folder", desc: "Admission Workflow" },
    { level: 3, name: "finance/", type: "folder", desc: "Financial Operations" },
    { level: 3, name: "transport/", type: "folder", desc: "Transport Module" },
    { level: 3, name: "hostel/", type: "folder", desc: "Hostel Management" },
    { level: 3, name: "library/", type: "folder", desc: "Library Operations" },
    { level: 3, name: "lms/", type: "folder", desc: "Learning Management" },
    { level: 3, name: "canteen/", type: "folder", desc: "Canteen & Wallet" },
    { level: 3, name: "marketplace/", type: "folder", desc: "School Marketplace" },
    { level: 3, name: "communication/", type: "folder", desc: "Messaging" },
    { level: 3, name: "security/", type: "folder", desc: "Audit & Compliance" },
    { level: 3, name: "analytics/", type: "folder", desc: "Reports & Stats" },
    { level: 2, name: "dashboard/", type: "folder", desc: "72 Dashboard Pages" },
    { level: 3, name: "students/", type: "folder", desc: "Student Pages" },
    { level: 3, name: "staff/", type: "folder", desc: "Staff Pages" },
    { level: 3, name: "admissions/", type: "folder", desc: "Admission Pages" },
    { level: 3, name: "finance/", type: "folder", desc: "Finance Pages" },
    { level: 3, name: "transport/", type: "folder", desc: "Transport Pages" },
    { level: 3, name: "...", type: "more", desc: "And more modules" },
    { level: 2, name: "login/", type: "folder", desc: "Auth Pages" },
    { level: 2, name: "layout.tsx", type: "file", desc: "Root Layout" },
    { level: 2, name: "page.tsx", type: "file", desc: "Home Page" },
    { level: 1, name: "components/", type: "folder", desc: "Reusable Components" },
    { level: 2, name: "ui/", type: "folder", desc: "Base UI Components" },
    { level: 3, name: "Button.tsx", type: "file", desc: "Button Component" },
    { level: 3, name: "Input.tsx", type: "file", desc: "Input Component" },
    { level: 3, name: "Modal.tsx", type: "file", desc: "Modal Component" },
    { level: 3, name: "Table.tsx", type: "file", desc: "Table Component" },
    { level: 2, name: "dashboard/", type: "folder", desc: "Dashboard Components" },
    { level: 3, name: "Sidebar.tsx", type: "file", desc: "Navigation Sidebar" },
    { level: 3, name: "Header.tsx", type: "file", desc: "Page Header" },
    { level: 1, name: "lib/", type: "folder", desc: "Utilities & Helpers" },
    { level: 2, name: "auth.ts", type: "file", desc: "NextAuth Config" },
    { level: 2, name: "prisma.ts", type: "file", desc: "DB Client" },
    { level: 2, name: "api-utils.ts", type: "file", desc: "API Helpers" },
    { level: 2, name: "validations.ts", type: "file", desc: "Zod Schemas" },
    { level: 1, name: "prisma/", type: "folder", desc: "Database Layer" },
    { level: 2, name: "schema.prisma", type: "file", desc: "60+ Models" },
    { level: 2, name: "migrations/", type: "folder", desc: "DB Migrations" },
    { level: 1, name: "public/", type: "folder", desc: "Static Assets" },
    { level: 1, name: "middleware.ts", type: "file", desc: "Auth Middleware" },
    { level: 1, name: "package.json", type: "file", desc: "Dependencies" },
    { level: 1, name: "tsconfig.json", type: "file", desc: "TypeScript Config" },
    { level: 1, name: "tailwind.config.js", type: "file", desc: "Tailwind Config" },
  ];

  const startY = 70;
  const lineHeight = 20;
  const indent = 25;
  const iconSize = 14;

  ctx.font = "13px Menlo, Monaco, monospace";
  ctx.textAlign = "left";

  tree.forEach((item, i) => {
    const y = startY + i * lineHeight;
    const x = 50 + item.level * indent;

    // Draw connection lines
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1;

    if (item.level > 0) {
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(x - indent + 7, y - lineHeight + 5);
      ctx.lineTo(x - indent + 7, y);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(x - indent + 7, y);
      ctx.lineTo(x - 5, y);
      ctx.stroke();
    }

    // Draw icon
    if (item.type === "folder") {
      ctx.fillStyle = folderColor;
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x + 6, y - 10);
      ctx.lineTo(x + 8, y - 7);
      ctx.lineTo(x + iconSize, y - 7);
      ctx.lineTo(x + iconSize, y + 3);
      ctx.lineTo(x, y + 3);
      ctx.closePath();
      ctx.fill();
    } else if (item.type === "file") {
      ctx.fillStyle = fileColor;
      ctx.fillRect(x + 2, y - 9, 10, 12);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + 4, y - 5, 6, 1);
      ctx.fillRect(x + 4, y - 2, 6, 1);
    } else {
      ctx.fillStyle = mediumGray;
      ctx.fillText("...", x, y);
    }

    // Draw name
    ctx.fillStyle = darkGray;
    ctx.font = "bold 13px Menlo, Monaco, monospace";
    ctx.fillText(item.name, x + iconSize + 5, y);

    // Draw description
    const nameWidth = ctx.measureText(item.name).width;
    ctx.fillStyle = mediumGray;
    ctx.font = "12px Arial";
    ctx.fillText("// " + item.desc, x + iconSize + 10 + nameWidth + 20, y);
  });

  // Stats box
  const statsY = startY + tree.length * lineHeight + 40;
  ctx.fillStyle = lightGray;
  ctx.fillRect(50, statsY, width - 100, 100);
  ctx.strokeStyle = "#d1d5db";
  ctx.strokeRect(50, statsY, width - 100, 100);

  ctx.fillStyle = darkGray;
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Project Statistics", width / 2, statsY + 25);

  const stats = [
    { label: "API Endpoints", value: "210+" },
    { label: "Dashboard Pages", value: "72" },
    { label: "Database Models", value: "60+" },
    { label: "UI Components", value: "12" },
  ];

  ctx.font = "13px Arial";
  stats.forEach((stat, i) => {
    const x = 120 + i * 180;
    ctx.fillStyle = "#1a56db";
    ctx.font = "bold 20px Arial";
    ctx.fillText(stat.value, x, statsY + 55);
    ctx.fillStyle = mediumGray;
    ctx.font = "12px Arial";
    ctx.fillText(stat.label, x, statsY + 75);
  });

  // Save
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync("directory-structure.png", buffer);
  console.log("Created: directory-structure.png");
}

// Generate both diagrams
createDataFlowDiagram();
createDirectoryDiagram();
