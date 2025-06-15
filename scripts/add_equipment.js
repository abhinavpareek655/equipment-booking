import "dotenv/config";
import mongoose from "mongoose";
import Equipment from "../dist/models/Equipment.js"; 

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
}

async function main() {
  await dbConnect();

  const equipment = [
    {
      "name": "Water Purification System",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 1.png"
    },
    {
      "name": "Liquid Nitrogen Storage Tanks",
      "department": "Life Sciences",
      "category": "Separation",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 2.png"
    },
    {
      "name": "Plant Growth Chambers",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 3.png"
    },
    {
      "name": "Vertical Gel electrophoresis system",
      "department": "Life Sciences",
      "category": "Molecular Biology",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 4.png"
    },
    {
      "name": "Horizontal Gel Electrophoresis System",
      "department": "Life Sciences",
      "category": "Molecular Biology",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 5.png"
    },
    {
      "name": "Semidry Gel Blotting System",
      "department": "Life Sciences",
      "category": "Molecular Biology",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 6.png"
    },
    {
      "name": "Circulatory Water Bath",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 7.png"
    },
    {
      "name": "Laminar Air Flow",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 8.png"
    },
    {
      "name": "High Speed Refrigerated Centrifuge",
      "department": "Life Sciences",
      "category": "Separation",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 9.png"
    },
    {
      "name": "Digital Microbalance",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 10.png"
    },
    {
      "name": "BSL-2 Biosafety Cabinet",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 11.png"
    },
    {
      "name": "Mammalian Cell Gene Transfection System",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 12.png"
    },
    {
      "name": "Multi Gas Incubator",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 13.png"
    },
    {
      "name": "Tissue Homogenizer with Single Cell Separator",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 14.png"
    },
    {
      "name": "-20\u00b0C Freezer",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 15.png"
    },
    {
      "name": "Inverted Microscope with Camera",
      "department": "Life Sciences",
      "category": "Microscopy",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 16.png"
    },
    {
      "name": "Ultrasonicator",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 17.png"
    },
    {
      "name": "Computer Workstation with Software for Genome Analysi",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 18.png"
    },
    {
      "name": "Electroporator for Microbial Cells",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 19.png"
    },
    {
      "name": "Automated DNA/RNA QC Analyzer",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 20.png"
    },
    {
      "name": "Multimode Reader",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 21.png"
    },
    {
      "name": "Real time PCR",
      "department": "Life Sciences",
      "category": "Molecular Biology",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 22.png"
    },
    {
      "name": "Upgraded Fluorescence Microscope for Live Cell Imaging",
      "department": "Life Sciences",
      "category": "Microscopy",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 23.png"
    },
    {
      "name": "Autoclave",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 24.png"
    },
    {
      "name": "Automated autoclave with vacuum system for BSL2 lab",
      "department": "Life Sciences",
      "category": "Analysis",
      "location": "CURAJ",
      "status": "Available",
      "imageUrl": "/images/Figure 25.png"
    }
  ];

  try {
    const created = await Equipment.insertMany(equipment);
    console.log("✅ Equipment added:", created.length);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error inserting equipment:", err);
    process.exit(1);
  }
}

main();
