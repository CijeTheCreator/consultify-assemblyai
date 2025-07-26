"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Trash2 } from "lucide-react"

interface Medication {
  drug_name: string
  amount: string
  frequency: string
}

interface PrescriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (medications: Medication[]) => void
  patientName: string
}

export default function PrescriptionModal({ isOpen, onClose, onSend, patientName }: PrescriptionModalProps) {
  const [medications, setMedications] = useState<Medication[]>([{ drug_name: "", amount: "", frequency: "" }])

  const addMedication = () => {
    setMedications([...medications, { drug_name: "", amount: "", frequency: "" }])
  }

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = medications.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    setMedications(updated)
  }

  const handleSend = () => {
    const validMedications = medications.filter(
      (med) => med.drug_name.trim() && med.amount.trim() && med.frequency.trim(),
    )

    if (validMedications.length > 0) {
      onSend(validMedications)
      setMedications([{ drug_name: "", amount: "", frequency: "" }])
      onClose()
    }
  }

  const handleClose = () => {
    setMedications([{ drug_name: "", amount: "", frequency: "" }])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Prescription</DialogTitle>
          <DialogDescription>Create a prescription for {patientName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700 border-b pb-2">
            <div className="col-span-5">Drug Name</div>
            <div className="col-span-3">Amount</div>
            <div className="col-span-3">Frequency</div>
            <div className="col-span-1">Action</div>
          </div>

          {medications.map((medication, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-5">
                <Label htmlFor={`drug-${index}`} className="sr-only">
                  Drug Name
                </Label>
                <Input
                  id={`drug-${index}`}
                  placeholder="e.g., Amoxicillin 500mg"
                  value={medication.drug_name}
                  onChange={(e) => updateMedication(index, "drug_name", e.target.value)}
                />
              </div>

              <div className="col-span-3">
                <Label htmlFor={`amount-${index}`} className="sr-only">
                  Amount
                </Label>
                <Input
                  id={`amount-${index}`}
                  placeholder="e.g., 1 tablet"
                  value={medication.amount}
                  onChange={(e) => updateMedication(index, "amount", e.target.value)}
                />
              </div>

              <div className="col-span-3">
                <Label htmlFor={`frequency-${index}`} className="sr-only">
                  Frequency
                </Label>
                <Input
                  id={`frequency-${index}`}
                  placeholder="e.g., 3 times daily"
                  value={medication.frequency}
                  onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                />
              </div>

              <div className="col-span-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMedication(index)}
                  disabled={medications.length === 1}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addMedication} className="w-full bg-transparent">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Medication
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!medications.some((med) => med.drug_name.trim() && med.amount.trim() && med.frequency.trim())}
          >
            Send Prescription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
