import React, { useState } from "react";
import { Button } from "@/components/ui/button";

type ModalPageProps = {
    isOpen: boolean;
    onClose: () => void;
    users: { id: string; name: string }[];
    onCreate: (selectedUserIds: string[]) => void;
    isCreating?: boolean;
};

export function ModalPage({ isOpen, onClose, users, onCreate, isCreating }: ModalPageProps) {
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    if (!isOpen) return null; // don't render anything if closed

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
        <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Select Users</h2>

            <div className="max-h-64 overflow-y-auto mb-4">
            {users.map(user => (
                <label key={user.id} className="flex items-center gap-2 mb-2">
                <input
                    type="checkbox"
                    value={user.id}
                    checked={selectedUserIds.includes(user.id)}
                    onChange={e => {
                    const id = e.target.value;
                    setSelectedUserIds(prev =>
                        prev.includes(id)
                        ? prev.filter(u => u !== id)
                        : [...prev, id]
                    );
                    }}
                />
                <span>{user.name}</span>
                </label>
            ))}
            </div>

            <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button
                onClick={() => {
                onCreate(selectedUserIds);
                setSelectedUserIds([]); // reset after creating
                }}
                disabled={selectedUserIds.length === 0 || isCreating}
            >
                Create
            </Button>
            </div>
        </div>
        </div>
    );
}
