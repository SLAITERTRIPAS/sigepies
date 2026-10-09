import { db } from "./firebase";
import { collection, getDocs, deleteDoc, query, where } from "firebase/firestore";

export async function clearActivitiesForInstitution(instituicaoId: string) {
  if (!instituicaoId) return;

  const collectionsToWipe = [
    "matrix_activities",
    "actividades",
    "plano_actividades",
  ];

  console.log(`🔥 Iniciando purga de atividades para a instituição: ${instituicaoId}...`);
  
  for (const colName of collectionsToWipe) {
    try {
      const colRef = collection(db, colName);
      const q = query(colRef, where("instituicaoId", "==", instituicaoId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        console.log(`🗑️ Eliminando ${snapshot.size} documentos de ${colName} da instituição ${instituicaoId}...`);
        
        const docs = snapshot.docs;
        for (let i = 0; i < docs.length; i += 100) {
          const batch = docs.slice(i, i + 100);
          await Promise.all(batch.map(d => deleteDoc(d.ref)));
        }
      }
    } catch (err) {
      console.warn(`Aviso ao limpar ${colName} para instituição ${instituicaoId}:`, err);
    }
  }
  console.log("✅ Limpeza de atividades por instituição concluída.");
}
