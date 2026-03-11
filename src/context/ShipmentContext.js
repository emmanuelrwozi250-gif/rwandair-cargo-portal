import { createContext, useContext, useState, useCallback } from 'react';
import { getLS, setLS } from '../utils/storage';
import { generateAWB, calculateRate, STATUSES } from '../utils/helpers';

const ShipmentContext = createContext(null);

export const ShipmentProvider = ({ children }) => {
  const [shipments, setShipments] = useState(() => getLS('cargo_shipments', []));

  const persist = (updated) => {
    setLS('cargo_shipments', updated);
    setShipments(updated);
  };

  const addShipment = useCallback((data, userId) => {
    const awb = generateAWB();
    const now = new Date().toISOString();
    const rate = calculateRate(
      data.originCode,
      data.destinationCode,
      data.weight,
      data.cargoType
    );
    const shipment = {
      awb,
      userId,
      status: 'Booked',
      origin: { code: data.originCode, city: data.originCity, country: data.originCountry },
      destination: {
        code: data.destinationCode,
        city: data.destinationCity,
        country: data.destinationCountry,
      },
      cargo: {
        type: data.cargoType,
        weight: parseFloat(data.weight),
        length: parseFloat(data.length) || 0,
        width: parseFloat(data.width) || 0,
        height: parseFloat(data.height) || 0,
        description: data.description || '',
        pieces: parseInt(data.pieces) || 1,
      },
      sender: {
        name: data.senderName,
        phone: data.senderPhone,
        email: data.senderEmail,
      },
      recipient: {
        name: data.recipientName,
        phone: data.recipientPhone,
        email: data.recipientEmail,
        address: data.recipientAddress || '',
      },
      rate,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          status: 'Booked',
          timestamp: now,
          location: data.originCity,
          note: 'Shipment booked successfully. Awaiting collection.',
        },
      ],
    };
    const all = getLS('cargo_shipments', []);
    persist([shipment, ...all]);
    return shipment;
  }, []);

  const getByAWB = useCallback(
    (awb) => shipments.find((s) => s.awb === awb),
    [shipments]
  );

  const getByUser = useCallback(
    (userId) => shipments.filter((s) => s.userId === userId),
    [shipments]
  );

  const advanceStatus = useCallback((awb) => {
    const all = getLS('cargo_shipments', []);
    const updated = all.map((s) => {
      if (s.awb !== awb) return s;
      const idx = STATUSES.indexOf(s.status);
      if (idx === STATUSES.length - 1) return s;
      const nextStatus = STATUSES[idx + 1];
      const now = new Date().toISOString();
      return {
        ...s,
        status: nextStatus,
        updatedAt: now,
        timeline: [
          ...s.timeline,
          {
            status: nextStatus,
            timestamp: now,
            location: nextStatus === 'Delivered' ? s.destination.city : s.origin.city,
            note: getStatusNote(nextStatus),
          },
        ],
      };
    });
    persist(updated);
  }, []);

  return (
    <ShipmentContext.Provider
      value={{ shipments, addShipment, getByAWB, getByUser, advanceStatus }}
    >
      {children}
    </ShipmentContext.Provider>
  );
};

const getStatusNote = (status) => {
  const notes = {
    Collected: 'Cargo collected and checked in at origin warehouse.',
    'In Transit': 'Shipment loaded on aircraft and en route.',
    'Customs Clearance': 'Shipment undergoing customs inspection at destination.',
    'Out for Delivery': 'Shipment cleared customs. Out for final delivery.',
    Delivered: 'Shipment successfully delivered to recipient.',
  };
  return notes[status] || '';
};

export const useShipments = () => useContext(ShipmentContext);
