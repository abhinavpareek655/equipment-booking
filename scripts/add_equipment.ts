import "dotenv/config"
import { dbConnect } from "../lib/db"
import Equipment from "../models/Equipment"

async function main() {
  await dbConnect()

  const equipment = [
    {
      name: "Flow Cytometer",
      department: "Life Sciences",
      category: "Cell Analysis",
      location: "Lab 101",
      status: "Available",
      imageUrl: "https://images.unsplash.com/photo-1676545228858-b4d9de95704b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Confocal Microscope",
      department: "Life Sciences",
      category: "Microscopy",
      location: "Lab 102",
      status: "Maintenance",
      imageUrl: "https://downloads.microscope.healthcare.nikon.com/production/imager/productphotos/62/c2plus-with-ni_ec7d1033075031a0254a7350f4e87eb4.jpg",
    },
    {
      name: "PCR Thermal Cycler",
      department: "Life Sciences",
      category: "Molecular Biology",
      location: "Lab 103",
      status: "Available",
      imageUrl: "https://www.bio-rad.com/sites/default/files/2023-12/ptc-tempo-thermal-cycler-pdp.png",
    },
    {
      name: "Ultra-centrifuge",
      department: "Life Sciences",
      category: "Separation",
      location: "Lab 104",
      status: "Available",
      imageUrl: "https://www.eppendorf.com/product-media/img/global/1260728/Centrifugation_Centrifuge-CP100NX_side-view_product.jpg?impolicy=fixed&width=320&height=240",
    },
    {
      name: "Mass Spectrometer",
      department: "Life Sciences",
      category: "Analysis",
      location: "Lab 105",
      status: "Reserved",
      imageUrl: "https://biologydictionary.net/wp-content/uploads/2018/04/Mass-Spectrometer-1.jpg",
    },
    {
      name: "HPLC System",
      department: "Life Sciences",
      category: "Chromatography",
      location: "Lab 106",
      status: "Available",
      imageUrl: "https://analyticalscience.wiley.com/cms/asset/e9c8a006-d543-4558-8e89-4815eaf6db6f/waters_alliance_2303.jpg",
    },
  ]

  const created = await Equipment.insertMany(equipment)
  console.log("✅ Equipment added:", created.length)
  process.exit(0)
}

main().catch((err) => {
  console.error("❌ Error inserting equipment:", err)
  process.exit(1)
})
