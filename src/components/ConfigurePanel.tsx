"use client";

import { useState, useTransition } from "react";
import { addCandidate, removeCandidate } from "@/app/actions/candidates";

type Contact = {
  id: string;
  firstname: string;
  lastname: string;
  profilPictureUrl?: string | null;
};

function Avatar({ contact, size = "md" }: { contact: Contact; size?: "sm" | "md" }) {
  const initials = `${contact.firstname?.[0] ?? "?"}${contact.lastname?.[0] ?? ""}`.toUpperCase();
  const dim = size === "sm" ? "w-10 h-10 text-sm" : "w-14 h-14 text-lg";
  return contact.profilPictureUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={contact.profilPictureUrl}
      alt={`${contact.firstname} ${contact.lastname}`}
      className={`${dim} rounded-full object-cover border-2 border-white shadow flex-shrink-0`}
    />
  ) : (
    <div className={`${dim} rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0 border-2 border-white shadow`}>
      {initials}
    </div>
  );
}

export default function ConfigurePanel({
  contacts,
  selected,
}: {
  contacts: Contact[];
  selected: Contact[];
}) {
  const [pending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const selectedIds = new Set(selected.map((c) => c.id));
  const available = contacts.filter((c) => !selectedIds.has(c.id));

  const [actionError, setActionError] = useState<string | null>(null);

  function handleAdd(contact: Contact) {
    console.log("[ConfigurePanel] handleAdd clicked", contact.id);
    setActionError(null);
    setLoadingId(contact.id);
    startTransition(async () => {
      const result = await addCandidate(contact.id);
      console.log("[ConfigurePanel] addCandidate result", result);
      if (result.error) setActionError(`addCandidate: ${result.error}`);
      setLoadingId(null);
    });
  }

  function handleRemove(contact: Contact) {
    console.log("[ConfigurePanel] handleRemove clicked", contact.id);
    setActionError(null);
    setLoadingId(contact.id);
    startTransition(async () => {
      const result = await removeCandidate(contact.id);
      console.log("[ConfigurePanel] removeCandidate result", result);
      if (result.error) setActionError(`removeCandidate: ${result.error}`);
      setLoadingId(null);
    });
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl">
      {actionError && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-sm text-red-700 font-mono break-all">
          ❌ {actionError}
        </div>
      )}
      {/* Selected candidates */}
      <section>
        <h2 className="text-lg font-semibold text-indigo-800 mb-3">
          Candidats sélectionnés ({selected.length})
        </h2>
        {selected.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Aucun candidat sélectionné.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {selected.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3"
              >
                <Avatar contact={c} size="sm" />
                <span className="flex-1 font-medium text-indigo-900">
                  {c.firstname} {c.lastname}
                </span>
                <button
                  onClick={() => handleRemove(c)}
                  disabled={pending && loadingId === c.id}
                  aria-label="Retirer"
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-600 font-bold transition-colors disabled:opacity-40"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <hr className="border-gray-200" />

      {/* All members */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Tous les membres ({contacts.length})
        </h2>
        <ul className="flex flex-col gap-2">
          {available.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-indigo-300 transition-colors"
            >
              <Avatar contact={c} size="sm" />
              <span className="flex-1 text-gray-800">
                {c.firstname} {c.lastname}
              </span>
              <button
                onClick={() => handleAdd(c)}
                disabled={pending && loadingId === c.id}
                aria-label="Ajouter comme candidat"
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-40"
              >
                + Ajouter
              </button>
            </li>
          ))}
          {available.length === 0 && (
            <p className="text-sm text-gray-400 italic">Tous les membres sont déjà sélectionnés.</p>
          )}
        </ul>
      </section>
    </div>
  );
}
