import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createInitialState } from '../data/initialState';
import { nextId } from '../utils/id';
import { addDaysISODate, todayISODate } from '../utils/format';
import { hasSlotConflict, isSlotBlockingStatus } from '../utils/appointments';
import { syncInventoryItemStatus } from '../utils/inventoryLevels';
import { getSlotTimesForDentistBranchDay, isSlotAllowedForDentistBranch } from '../data/dentistBranchAvailability';

const AppDataContext = createContext(null);

function cloneState(s) {
  return structuredClone(s);
}

export function AppDataProvider({ children }) {
  const [state, setState] = useState(() => createInitialState());
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((message, type = 'success') => {
    const id = nextId('toast');
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  function reminderAtForAppointment(date, time) {
    if (!date || !time) return null;
    const dayBefore = addDaysISODate(date, -1);
    return `${dayBefore}T${time}:00`;
  }

  const bookAppointment = useCallback(
    ({
      patientId,
      dentistId,
      branchId,
      specialty,
      date,
      time,
      notes = '',
      createdBy = 'patient',
      requestedServiceCode = null,
      requestedServiceLabel = null,
    }) => {
      let error = null;
      setState((prev) => {
        const s = cloneState(prev);
        if (!isSlotAllowedForDentistBranch(dentistId, branchId, date, time, s.dentists)) {
          error =
            'This time slot is not offered at this branch for the selected dentist. Please choose another available appointment time.';
          return prev;
        }
        const conflict = hasSlotConflict(s.appointments, { dentistId, date, time });
        if (conflict) {
          error = 'This time slot is no longer available. Please choose another available appointment time.';
          return prev;
        }
        const id = nextId('APT');
        const isPatientPortal = createdBy === 'patient';
        const reminderAt = reminderAtForAppointment(date, time);
        s.appointments.push({
          id,
          branchId,
          patientId,
          dentistId,
          specialty,
          date,
          time,
          status: 'Scheduled',
          notes,
          reminderStatus: reminderAt ? 'Scheduled' : 'Pending',
          reminderAt,
          createdBy,
          requestedServiceCode: requestedServiceCode || null,
          requestedServiceLabel: requestedServiceLabel || null,
          ratingEligible: false,
          bookedAt: new Date().toISOString(),
          patientNewForDentist: isPatientPortal,
        });
        const invId = nextId('INV');
        s.invoices.push({
          id: invId,
          branchId,
          dentistId,
          patientId,
          treatmentRecordId: null,
          appointmentId: id,
          date: todayISODate(),
          visitPending: true,
          lines: [
            {
              code: 'TBD',
              label: 'Final treatment and cost will be determined after your visit.',
              qty: 1,
              unitPrice: 0,
            },
          ],
          subtotal: 0,
          amount: 0,
          amountPaid: 0,
          status: 'Pending',
          dueDate: date,
        });
        return s;
      });
      if (error) {
        pushToast(error, 'error');
        return { ok: false, error };
      }
      pushToast('Appointment booked successfully.');
      pushToast('Reminder scheduled 24 hours before your appointment.');
      return { ok: true };
    },
    [pushToast],
  );

  const cancelAppointment = useCallback((appointmentId) => {
    setState((prev) => {
      const s = cloneState(prev);
      const a = s.appointments.find((x) => x.id === appointmentId);
      if (a) a.status = 'Cancelled';
      return s;
    });
    pushToast('Appointment cancelled.');
  }, [pushToast]);

  /** Dentist clears “new patient booking” highlights after reviewing their schedule. */
  const acknowledgeDentistPatientBookings = useCallback((dentistId) => {
    setState((prev) => {
      const s = cloneState(prev);
      s.appointments.forEach((a) => {
        if (a.dentistId === dentistId) a.patientNewForDentist = false;
      });
      return s;
    });
  }, []);

  /** Marks visit complete: shared across patient, dentist, assistant, invoices, visits. */
  const completeAppointment = useCallback(
    (appointmentId) => {
      setState((prev) => {
        const s = cloneState(prev);
        const appt = s.appointments.find((a) => a.id === appointmentId);
        if (!appt || appt.status === 'Completed') return prev;
        if (['Cancelled', 'No Show'].includes(appt.status)) return prev;

        appt.status = 'Completed';
        appt.ratingEligible = true;
        appt.patientNewForDentist = false;

        let visit = s.visits.find((v) => v.appointmentId === appointmentId);
        if (!visit) {
          const vid = nextId('V');
          visit = {
            id: vid,
            branchId: appt.branchId,
            patientId: appt.patientId,
            dentistId: appt.dentistId,
            appointmentId: appt.id,
            date: appt.date,
            chiefComplaint: appt.requestedServiceLabel || 'Scheduled visit',
            notes: 'Visit completed — clinical documentation on file.',
          };
          s.visits.push(visit);
        }

        let tr = s.treatmentRecords.find((t) => t.visitId === visit.id);
        if (!tr) {
          const consult = s.serviceRates.find((r) => r.code === 'GEN-CHK');
          const tid = nextId('TR');
          tr = {
            id: tid,
            branchId: appt.branchId,
            patientId: appt.patientId,
            visitId: visit.id,
            dentistId: appt.dentistId,
            date: todayISODate(),
            serviceCode: consult?.code || 'GEN-CHK',
            procedureType: consult?.label || 'Dental consultation & examination',
            diagnosis: 'Visit completed',
            details: 'Chairside care per appointment schedule.',
            notes: '',
          };
          s.treatmentRecords.push(tr);
        }

        const consult = s.serviceRates.find((r) => r.code === 'GEN-CHK');
        const amt = consult?.price ?? 0;
        let inv = s.invoices.find((i) => i.appointmentId === appointmentId);

        if (inv && inv.visitPending) {
          inv.visitPending = false;
          inv.treatmentRecordId = tr.id;
          inv.dentistId = appt.dentistId;
          inv.date = todayISODate();
          const line = consult
            ? {
                code: consult.code,
                label: consult.label,
                qty: 1,
                unitPrice: consult.price,
                priceMin: consult.priceMin,
                priceMax: consult.priceMax,
              }
            : { code: 'GEN-CHK', label: 'Consultation', qty: 1, unitPrice: amt };
          inv.lines = [line];
          inv.subtotal = amt;
          inv.amount = amt;
          inv.amountPaid = inv.amountPaid || 0;
          inv.status =
            amt <= 0 ? 'Paid' : inv.amountPaid >= amt ? 'Paid' : inv.amountPaid > 0 ? 'Partially Paid' : 'Unpaid';
          inv.dueDate = addDaysISODate(todayISODate(), 21);
          let ar = s.accountsReceivable.find((r) => r.invoiceId === inv.id);
          if (amt > 0) {
            const out = Math.max(0, amt - (inv.amountPaid || 0));
            if (!ar) {
              s.accountsReceivable.push({
                id: nextId('AR'),
                branchId: inv.branchId,
                invoiceId: inv.id,
                patientId: inv.patientId,
                outstanding: out,
                dueDate: inv.dueDate,
                status: out <= 0 ? 'Cleared' : 'Current',
              });
            } else {
              ar.outstanding = out;
              ar.dueDate = inv.dueDate;
              ar.status = out <= 0 ? 'Cleared' : inv.amountPaid > 0 ? 'Partial' : 'Current';
            }
          }
        } else if (!inv && amt > 0) {
          const iid = nextId('INV');
          const line = consult
            ? {
                code: consult.code,
                label: consult.label,
                qty: 1,
                unitPrice: consult.price,
                priceMin: consult.priceMin,
                priceMax: consult.priceMax,
              }
            : { code: 'GEN-CHK', label: 'Consultation', qty: 1, unitPrice: amt };
          inv = {
            id: iid,
            branchId: appt.branchId,
            dentistId: appt.dentistId,
            patientId: appt.patientId,
            treatmentRecordId: tr.id,
            appointmentId: appt.id,
            date: todayISODate(),
            visitPending: false,
            lines: [line],
            subtotal: amt,
            amount: amt,
            amountPaid: 0,
            status: 'Unpaid',
            dueDate: addDaysISODate(todayISODate(), 21),
          };
          s.invoices.push(inv);
          s.accountsReceivable.push({
            id: nextId('AR'),
            branchId: inv.branchId,
            invoiceId: inv.id,
            patientId: inv.patientId,
            outstanding: amt,
            dueDate: inv.dueDate,
            status: 'Current',
          });
        }

        return s;
      });
      pushToast('Appointment marked completed.');
    },
    [pushToast],
  );

  const rescheduleAppointment = useCallback(
    ({ appointmentId, date, time }) => {
      let error = null;
      setState((prev) => {
        const s = cloneState(prev);
        const appt = s.appointments.find((x) => x.id === appointmentId);
        if (!appt) return prev;
        if (!isSlotAllowedForDentistBranch(appt.dentistId, appt.branchId, date, time, s.dentists)) {
          error =
            'This time slot is not offered at this branch for the selected dentist. Please choose another available appointment time.';
          return prev;
        }
        const conflict = hasSlotConflict(s.appointments, {
          dentistId: appt.dentistId,
          date,
          time,
          excludeAppointmentId: appointmentId,
        });
        if (conflict) {
          error = 'This time slot is no longer available. Please choose another available appointment time.';
          return prev;
        }
        appt.date = date;
        appt.time = time;
        appt.reminderStatus = 'Pending';
        if (!['Cancelled', 'No Show', 'Completed'].includes(appt.status)) {
          appt.status = 'Scheduled';
        }
        const pendInv = s.invoices.find((i) => i.appointmentId === appointmentId && i.visitPending);
        if (pendInv) pendInv.dueDate = date;
        return s;
      });
      if (error) {
        pushToast(error, 'error');
        return { ok: false };
      }
      pushToast('Appointment rescheduled.');
      return { ok: true };
    },
    [pushToast],
  );

  const makePatientPayment = useCallback(
    ({ invoiceId, amount, method }) => {
      let blocked = false;
      setState((prev) => {
        const s = cloneState(prev);
        const inv = s.invoices.find((i) => i.id === invoiceId);
        if (!inv) return prev;
        if (inv.visitPending || inv.status === 'Pending') {
          blocked = true;
          return prev;
        }
        const paid = (inv.amountPaid || 0) + Number(amount);
        inv.amountPaid = paid;
        if (paid >= inv.amount) {
          inv.status = 'Paid';
        } else if (paid > 0) {
          inv.status = 'Partially Paid';
        }
        const pid = inv.patientId;
        s.payments.push({
          id: nextId('PAY'),
          branchId: inv.branchId,
          invoiceId,
          patientId: pid,
          amount: Number(amount),
          method,
          date: todayISODate(),
          recordedBy: 'PATIENT-PORTAL',
          status: 'Completed',
        });
        const ar = s.accountsReceivable.find((r) => r.invoiceId === invoiceId);
        if (ar) {
          ar.outstanding = Math.max(0, inv.amount - paid);
          ar.status = ar.outstanding <= 0 ? 'Cleared' : paid > 0 ? 'Partial' : ar.status;
        }
        return s;
      });
      if (blocked) {
        pushToast('Payment opens after your visit once the invoice is finalized.', 'error');
        return;
      }
      pushToast('Payment recorded.');
    },
    [pushToast],
  );

  const submitRating = useCallback(
    ({ appointmentId, stars, comment, doctorStars, experienceStars }) => {
      setState((prev) => {
        const s = cloneState(prev);
        const appt = s.appointments.find((a) => a.id === appointmentId);
        if (!appt || appt.status !== 'Completed') return prev;
        let r = s.ratings.find((x) => x.appointmentId === appointmentId);
        const doc = doctorStars ?? stars;
        const exp = experienceStars ?? stars;
        if (!r) {
          r = {
            id: nextId('RT'),
            branchId: appt.branchId,
            appointmentId,
            patientId: appt.patientId,
            stars: exp,
            doctorStars: doc,
            experienceStars: exp,
            comment: '',
            submitted: false,
          };
          s.ratings.push(r);
        }
        r.stars = exp;
        r.doctorStars = doc;
        r.experienceStars = exp;
        r.comment = comment;
        r.submitted = true;
        appt.ratingEligible = false;
        return s;
      });
      pushToast('Thank you for your feedback.');
    },
    [pushToast],
  );

  const addTreatmentRecord = useCallback(
    (payload) => {
      setState((prev) => {
        const s = cloneState(prev);
        const id = nextId('TR');
        s.treatmentRecords.push({
          id,
          branchId: payload.branchId || null,
          patientId: payload.patientId,
          visitId: payload.visitId || null,
          dentistId: payload.dentistId,
          date: payload.date || todayISODate(),
          serviceCode: payload.serviceCode || null,
          procedureType: payload.procedureType,
          diagnosis: payload.diagnosis,
          details: payload.details,
          notes: payload.notes || '',
        });
        return s;
      });
      pushToast('Treatment record saved.');
    },
    [pushToast],
  );

  const addPrescription = useCallback(
    (payload) => {
      setState((prev) => {
        const s = cloneState(prev);
        s.prescriptions.push({
          id: nextId('RX'),
          branchId: payload.branchId || null,
          patientId: payload.patientId,
          treatmentRecordId: payload.treatmentRecordId || null,
          dentistId: payload.dentistId,
          medicine: payload.medicine,
          dosage: payload.dosage,
          duration: payload.duration,
          instructions: payload.instructions || '',
          date: payload.date || todayISODate(),
        });
        return s;
      });
      pushToast('Prescription created.');
    },
    [pushToast],
  );

  const updateVisitNotes = useCallback((visitId, notes) => {
    setState((prev) => {
      const s = cloneState(prev);
      const v = s.visits.find((x) => x.id === visitId);
      if (v) v.notes = notes;
      return s;
    });
    pushToast('Visit notes updated.');
  }, [pushToast]);

  const registerPatient = useCallback(
    (form) => {
      let error = null;
      let createdPatientId = null;
      setState((prev) => {
        const s = cloneState(prev);
        const nid = form.nationalId?.trim();
        const dup = s.patients.some(
          (p) => p.email === form.email || (nid && p.nationalId === nid),
        );
        if (dup) {
          error = 'A patient with this email or national ID already exists.';
          return prev;
        }
        const id = nextId('P');
        createdPatientId = id;
        s.patients.push({
          id,
          fullName: form.fullName,
          nationalId: nid || `TEMP-${id}`,
          dob: form.dob,
          gender: form.gender,
          phone: form.phone,
          email: form.email,
          address: form.address,
          bloodType: form.bloodType,
          allergies: form.allergies,
          chronicConditions: form.chronicConditions,
          emergencyContact: {
            name: form.emergencyName,
            relation: form.emergencyRelation,
            phone: form.emergencyPhone,
          },
          preferredBranchId: form.preferredBranchId || null,
          medicalAttachment: form.medicalAttachment ?? null,
          notes: form.notes || '',
          registeredAt: todayISODate(),
        });
        s.medicalRecords.push({
          patientId: id,
          summary: 'New patient — medical history to be completed at first visit.',
          lastUpdated: todayISODate(),
        });
        return s;
      });
      if (error) {
        pushToast(error, 'error');
        return { ok: false };
      }
      pushToast('Patient registered.');
      return { ok: true, patientId: createdPatientId };
    },
    [pushToast],
  );

  const updatePatient = useCallback((patientId, patch) => {
    setState((prev) => {
      const s = cloneState(prev);
      const p = s.patients.find((x) => x.id === patientId);
      if (p) Object.assign(p, patch);
      return s;
    });
    pushToast('Patient information saved.');
  }, [pushToast]);

  const upsertAppointment = useCallback(
    (payload) => {
      let error = null;
      setState((prev) => {
        const s = cloneState(prev);
        if (payload.id) {
          const a = s.appointments.find((x) => x.id === payload.id);
          if (!a) return prev;
          const merged = { ...a, ...payload };
          if (!isSlotAllowedForDentistBranch(merged.dentistId, merged.branchId, merged.date, merged.time, s.dentists)) {
            error =
              'This time slot is not offered at this branch for the selected dentist. Please choose another available appointment time.';
            return prev;
          }
          const conflict = hasSlotConflict(s.appointments, {
            dentistId: merged.dentistId,
            date: merged.date,
            time: merged.time,
            excludeAppointmentId: payload.id,
          });
          if (conflict) {
            error = 'This time slot is no longer available. Please choose another available appointment time.';
            return prev;
          }
          Object.assign(a, payload);
        } else {
          if (!isSlotAllowedForDentistBranch(payload.dentistId, payload.branchId, payload.date, payload.time, s.dentists)) {
            error =
              'This time slot is not offered at this branch for the selected dentist. Please choose another available appointment time.';
            return prev;
          }
          const conflict = hasSlotConflict(s.appointments, {
            dentistId: payload.dentistId,
            date: payload.date,
            time: payload.time,
          });
          if (conflict) {
            error = 'This time slot is no longer available. Please choose another available appointment time.';
            return prev;
          }
          s.appointments.push({
            id: nextId('APT'),
            branchId: payload.branchId,
            patientId: payload.patientId,
            dentistId: payload.dentistId,
            specialty: payload.specialty,
            date: payload.date,
            time: payload.time,
            status: payload.status || 'Scheduled',
            notes: payload.notes || '',
            reminderStatus: 'Pending',
            createdBy: 'assistant',
            requestedServiceCode: payload.requestedServiceCode || null,
            requestedServiceLabel: payload.requestedServiceLabel || null,
            ratingEligible: false,
            bookedAt: new Date().toISOString(),
            patientNewForDentist: false,
          });
        }
        return s;
      });
      if (error) {
        pushToast(error, 'error');
        return { ok: false, error };
      }
      pushToast('Appointments updated.');
      return { ok: true };
    },
    [pushToast],
  );

  const generateInvoice = useCallback(
    ({ patientId, treatmentRecordId, serviceCode, qty = 1, branchId, dentistId }) => {
      setState((prev) => {
        const s = cloneState(prev);
        const rate = s.serviceRates.find((r) => r.code === serviceCode);
        if (!rate) return prev;
        const tr = treatmentRecordId ? s.treatmentRecords.find((t) => t.id === treatmentRecordId) : null;
        const amount = rate.price * qty;
        const subtotal = amount;
        const id = nextId('INV');
        const line = {
          code: rate.code,
          label: rate.label,
          qty,
          unitPrice: rate.price,
          ...(rate.priceMin != null && rate.priceMax != null
            ? { priceMin: rate.priceMin, priceMax: rate.priceMax }
            : {}),
        };
        s.invoices.push({
          id,
          branchId: branchId || tr?.branchId || null,
          dentistId: dentistId || tr?.dentistId || null,
          patientId,
          treatmentRecordId: treatmentRecordId || null,
          date: todayISODate(),
          lines: [line],
          subtotal,
          amount,
          amountPaid: 0,
          status: 'Unpaid',
          dueDate: todayISODate(),
        });
        s.accountsReceivable.push({
          id: nextId('AR'),
          branchId: branchId || tr?.branchId || null,
          invoiceId: id,
          patientId,
          outstanding: amount,
          dueDate: todayISODate(),
          status: 'Current',
        });
        return s;
      });
      pushToast('Invoice generated.');
    },
    [pushToast],
  );

  const recordStaffPayment = useCallback(
    ({ invoiceId, amount, method, date, recordedBy = 'A-001' }) => {
      setState((prev) => {
        const s = cloneState(prev);
        const inv = s.invoices.find((i) => i.id === invoiceId);
        if (!inv) return prev;
        const paid = (inv.amountPaid || 0) + Number(amount);
        inv.amountPaid = paid;
        if (paid >= inv.amount) inv.status = 'Paid';
        else if (paid > 0) inv.status = 'Partially Paid';
        s.payments.push({
          id: nextId('PAY'),
          branchId: inv.branchId,
          invoiceId,
          patientId: inv.patientId,
          amount: Number(amount),
          method,
          date: date || todayISODate(),
          recordedBy,
          status: 'Completed',
        });
        const ar = s.accountsReceivable.find((r) => r.invoiceId === invoiceId);
        if (ar) {
          ar.outstanding = Math.max(0, inv.amount - paid);
          ar.status = ar.outstanding <= 0 ? 'Cleared' : 'Current';
        }
        return s;
      });
      pushToast('Payment recorded.');
    },
    [pushToast],
  );

  const recordSupplyUsage = useCallback(
    ({ inventoryItemId, quantity, visitId, treatmentRecordId, recordedBy = 'A-001' }) => {
      let error = null;
      setState((prev) => {
        const s = cloneState(prev);
        const item = s.inventory.find((i) => i.id === inventoryItemId);
        if (!item || quantity > item.quantity) {
          error = 'Quantity exceeds available stock.';
          return prev;
        }
        item.quantity -= quantity;
        syncInventoryItemStatus(item);
        s.supplyUsage.push({
          id: nextId('SU'),
          branchId: item.branchId,
          inventoryItemId,
          quantity,
          visitId: visitId || null,
          treatmentRecordId: treatmentRecordId || null,
          date: todayISODate(),
          recordedBy,
        });
        return s;
      });
      if (error) {
        pushToast(error, 'error');
        return { ok: false };
      }
      pushToast('Supply usage recorded.');
      return { ok: true };
    },
    [pushToast],
  );

  const createRefillRequest = useCallback(({ inventoryItemId, requestedQty, branchId, requestedBy = 'A-001' }) => {
    setState((prev) => {
      const s = cloneState(prev);
      const item = s.inventory.find((i) => i.id === inventoryItemId);
      s.refillRequests.push({
        id: nextId('RF'),
        branchId: branchId || item?.branchId,
        inventoryItemId,
        requestedQty: Number(requestedQty),
        status: 'Pending',
        date: todayISODate(),
        requestedBy,
      });
      return s;
    });
    pushToast('Refill request submitted.');
  }, [pushToast]);

  const createPurchaseOrder = useCallback(({ supplierId, items, notes, branchId }) => {
    setState((prev) => {
      const s = cloneState(prev);
      let estTotal = 0;
      const lines = items.map((it) => {
        estTotal += it.qty * it.estUnitPrice;
        return { inventoryItemId: it.inventoryItemId, name: it.name, qty: it.qty, estUnitPrice: it.estUnitPrice };
      });
      const inferredBranch =
        branchId ||
        (lines[0] ? s.inventory.find((i) => i.id === lines[0].inventoryItemId)?.branchId : null) ||
        null;
      s.purchaseOrders.push({
        id: nextId('PO'),
        branchId: inferredBranch,
        supplierId,
        status: 'Pending Approval',
        createdDate: todayISODate(),
        items: lines,
        estTotal,
        notes: notes || '',
      });
      return s;
    });
    pushToast('Purchase order created (pending approval).');
  }, [pushToast]);

  const receiveSupplierDelivery = useCallback(({ purchaseOrderId, lines, notes }) => {
    setState((prev) => {
      const s = cloneState(prev);
      const po = s.purchaseOrders.find((p) => p.id === purchaseOrderId);
      const enrichedLines = [];
      lines.forEach((ln) => {
        const inv = s.inventory.find((i) => i.id === ln.inventoryItemId);
        if (inv) {
          inv.quantity += ln.deliveredQty;
          syncInventoryItemStatus(inv);
        }
        const ordered =
          po?.items?.find((it) => it.inventoryItemId === ln.inventoryItemId)?.qty ?? ln.deliveredQty;
        enrichedLines.push({
          ...ln,
          orderedQty: ordered,
          variance: ln.deliveredQty - ordered,
        });
      });
      const hasMismatch = enrichedLines.some((ln) => ln.variance !== 0);
      s.deliveryRecords.push({
        id: nextId('DL'),
        branchId: po?.branchId || null,
        purchaseOrderId,
        supplierId: po?.supplierId || null,
        date: todayISODate(),
        notes: notes || '',
        lines: enrichedLines,
        receiptStatus: hasMismatch ? 'Mismatch' : 'Complete',
      });
      if (po) po.status = 'Received';
      return s;
    });
    pushToast('Delivery recorded and inventory updated.');
  }, [pushToast]);

  const approvePurchaseOrder = useCallback((poId) => {
    setState((prev) => {
      const s = cloneState(prev);
      const po = s.purchaseOrders.find((p) => p.id === poId);
      if (po) po.status = 'Approved';
      return s;
    });
    pushToast('Purchase order approved.');
  }, [pushToast]);

  const rejectPurchaseOrder = useCallback((poId) => {
    setState((prev) => {
      const s = cloneState(prev);
      const po = s.purchaseOrders.find((p) => p.id === poId);
      if (po) po.status = 'Rejected';
      return s;
    });
    pushToast('Purchase order rejected.');
  }, [pushToast]);

  const saveSmilePreview = useCallback(
    ({ patientId, dentistId, procedure, beforeDataUrl, afterDataUrl, createdDate, disclaimer }) => {
      setState((prev) => {
        const s = cloneState(prev);
        if (!s.smilePreviews) s.smilePreviews = [];
        s.smilePreviews.push({
          id: nextId('SPV'),
          patientId,
          dentistId,
          procedure,
          beforeDataUrl,
          afterDataUrl,
          createdDate: createdDate || todayISODate(),
          disclaimer: disclaimer || '',
        });
        return s;
      });
      pushToast('Preview saved to patient profile.');
    },
    [pushToast],
  );

  const savePostTreatmentCare = useCallback(
    ({ patientId, dentistId, careNotes, warnings, attachmentFileName, sendToPatient }) => {
      setState((prev) => {
        const s = cloneState(prev);
        if (!s.postTreatmentCare) s.postTreatmentCare = [];
        s.postTreatmentCare.push({
          id: nextId('PTC'),
          patientId,
          dentistId,
          careNotes: careNotes || '',
          warnings: warnings || '',
          attachmentFileName: attachmentFileName || null,
          createdDate: todayISODate(),
          sentToPatient: Boolean(sendToPatient),
        });
        return s;
      });
      pushToast(
        sendToPatient
          ? 'Saved to patient profile — marked for patient portal (prototype).'
          : 'Post-treatment procedure saved to patient profile.',
      );
    },
    [pushToast],
  );

  const getAvailableSlots = useCallback(
    (dentistId, date, branchId, excludeAppointmentId = null) => {
      const candidates = getSlotTimesForDentistBranchDay(dentistId, branchId, date, state.dentists);
      const takenGlobal = new Set(
        state.appointments
          .filter(
            (a) =>
              (!excludeAppointmentId || a.id !== excludeAppointmentId) &&
              a.dentistId === dentistId &&
              a.date === date &&
              isSlotBlockingStatus(a.status),
          )
          .map((a) => a.time),
      );
      return candidates.filter((t) => !takenGlobal.has(t));
    },
    [state.appointments, state.dentists],
  );

  const value = useMemo(
    () => ({
      state,
      toasts,
      pushToast,
      bookAppointment,
      cancelAppointment,
      rescheduleAppointment,
      acknowledgeDentistPatientBookings,
      completeAppointment,
      makePatientPayment,
      submitRating,
      addTreatmentRecord,
      addPrescription,
      updateVisitNotes,
      registerPatient,
      updatePatient,
      upsertAppointment,
      generateInvoice,
      recordStaffPayment,
      recordSupplyUsage,
      createRefillRequest,
      createPurchaseOrder,
      receiveSupplierDelivery,
      approvePurchaseOrder,
      rejectPurchaseOrder,
      getAvailableSlots,
      saveSmilePreview,
      savePostTreatmentCare,
    }),
    [
      state,
      toasts,
      pushToast,
      bookAppointment,
      cancelAppointment,
      rescheduleAppointment,
      acknowledgeDentistPatientBookings,
      completeAppointment,
      makePatientPayment,
      submitRating,
      addTreatmentRecord,
      addPrescription,
      updateVisitNotes,
      registerPatient,
      updatePatient,
      upsertAppointment,
      generateInvoice,
      recordStaffPayment,
      recordSupplyUsage,
      createRefillRequest,
      createPurchaseOrder,
      receiveSupplierDelivery,
      approvePurchaseOrder,
      rejectPurchaseOrder,
      getAvailableSlots,
      saveSmilePreview,
      savePostTreatmentCare,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
