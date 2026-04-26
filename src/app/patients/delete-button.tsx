"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash, Loader2 } from "lucide-react";
import { deletePatient } from "@/lib/patient-service";

export function DeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir o paciente "${name}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    setDeleting(true);
    try {
      await deletePatient(id);
      router.refresh();
    } catch (error) {
      console.error("Erro ao excluir paciente:", error);
      alert("Erro ao excluir paciente. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      className="icon-btn text-danger"
      title="Excluir paciente"
      onClick={handleDelete}
      disabled={deleting}
    >
      {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash size={18} />}
    </button>
  );
}
