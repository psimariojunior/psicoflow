var fs = require("fs")
var c = fs.readFileSync("prisma/schema.prisma", "utf8")

var newModels = `

model Receipt {
  id              String   @id @default(cuid())
  number          String   @unique
  patientName     String
  patientDoc      String?
  description     String
  amount          Float
  issueDate       DateTime @default(now())
  appointmentDate DateTime?
  paymentMethod   String?
  status          String   @default("ISSUED")
  pdfUrl          String?
  sentAt          DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  psychologistId  String
  psychologist    User     @relation(fields: [psychologistId], references: [id])
  patientId       String?
  patient         Patient?  @relation(fields: [patientId], references: [id], onDelete: SetNull)
  appointmentId   String?
  appointment     Appointment? @relation(fields: [appointmentId], references: [id], onDelete: SetNull)

  @@index([psychologistId])
  @@index([patientId])
  @@index([number])
}

model WaitingList {
  id             String   @id @default(cuid())
  patientName    String
  patientEmail   String?
  patientPhone   String?
  preferredDay   String?
  preferredTime  String?
  notes          String?
  status         String   @default("WAITING")
  notifiedAt     DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  psychologistId String
  psychologist   User     @relation(fields: [psychologistId], references: [id])
  patientId      String?
  patient        Patient? @relation(fields: [patientId], references: [id], onDelete: SetNull)

  @@index([psychologistId])
  @@index([status])
}

model BackupLog {`

c = c.replace("model BackupLog {", newModels)
fs.writeFileSync("prisma/schema.prisma", c)
console.log("OK")
