import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

type Appointment = {
  id: number;
  date: string;
  time: string;
  description: string;
};

const localizer = momentLocalizer(moment);

const Makeappointment: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [newAppointment, setNewAppointment] = useState<Appointment>({
    id: 0,
    date: '',
    time: '',
    description: '',
  });
  const [suggestedSlot, setSuggestedSlot] = useState<Appointment | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const storedAppointments = localStorage.getItem('appointments');
    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewAppointment({ ...newAppointment, [e.target.name]: e.target.value });
  };

  const isSlotAvailable = (slotDate: string, slotTime: string): boolean => {
    const conflictingAppointment = appointments.find(
      appointment => appointment.date === slotDate && appointment.time === slotTime
    );

    return !conflictingAppointment;
  };

  const handleAddAppointment = () => {
    const slotDate = moment(newAppointment.date).format('YYYY-MM-DD');
    const slotTime = moment(newAppointment.time, 'HH:mm').format('HH:mm');

    if (isSlotAvailable(slotDate, slotTime)) {
      setAppointments([...appointments, { ...newAppointment, id: Date.now() }]);
      setNewAppointment({ id: 0, date: '', time: '', description: '' });
    } else {
      let suggestedSlotDate = slotDate;
      let suggestedSlotTime = slotTime;

      while (!isSlotAvailable(suggestedSlotDate, suggestedSlotTime)) {
        const nextSlotTime = moment(suggestedSlotTime, 'HH:mm').add(30, 'minutes');
        if (nextSlotTime.isAfter(moment('22:00', 'HH:mm'))) {
          suggestedSlotDate = moment(suggestedSlotDate).add(1, 'day').format('YYYY-MM-DD');
          suggestedSlotTime = '08:00';
        } else {
          suggestedSlotTime = nextSlotTime.format('HH:mm');
        }
      }

      setSuggestedSlot({
        id: Date.now(),
        date: suggestedSlotDate,
        time: suggestedSlotTime,
        description: newAppointment.description,
      });
      setShowPopup(true);
    }
  };

  const handleAcceptSuggestedSlot = () => {
    if (suggestedSlot) {
      setAppointments([...appointments, suggestedSlot]);
      setNewAppointment({ id: 0, date: '', time: '', description: '' });
      setSuggestedSlot(null);
      setShowPopup(false);
    }
  };

  const handleRejectSuggestedSlot = () => {
    setSuggestedSlot(null);
    setShowPopup(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Manage Appointments</h1>

      <div className="flex flex-col mb-4">
        <label htmlFor="date" className="mb-2">
          Date:
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={newAppointment.date}
          onChange={handleInputChange}
          className="border border-gray-300 rounded p-2"
        />
      </div>
      <div className="flex flex-col mb-4">
        <label htmlFor="time" className="mb-2">
          Time:
        </label>
        <input
          type="time"
          id="time"
          name="time"
          value={newAppointment.time}
          onChange={handleInputChange}
          className="border border-gray-300 rounded p-2"
        />
      </div>
      <div className="flex flex-col mb-4">
        <label htmlFor="description" className="mb-2">
          Description:
        </label>
        <textarea
          id="description"
          name="description"
          value={newAppointment.description}
          onChange={handleInputChange}
          className="border border-gray-300 rounded p-2"
        ></textarea>
      </div>
      <button
        onClick={handleAddAppointment}
        className="bg-blue-500 text-white py-2 px-4 rounded"
      >
        Add Appointment
      </button>

      <h2 className="text-xl font-bold mt-8 text-center">Appointment List</h2>
      <Calendar
        localizer={localizer}
        events={appointments.map(appointment => ({
          start: new Date(appointment.date + ' ' + appointment.time),
          end: new Date(appointment.date + ' ' + appointment.time),
          title: appointment.description,
        }))}
        views={['month', 'week']}
        step={30}
        timeslots={2}
        defaultView="week"
        defaultDate={new Date()}
        min={new Date(0, 0, 0, 8, 0, 0)}
        max={new Date(0, 0, 0, 22, 0, 0)}
        length={2}
        showMultiDayTimes
        selectable={false}
      />

      {suggestedSlot && showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-8 rounded shadow">
            <p className="mb-2">
              The selected slot is already occupied. The closest available slot is{' '}
              {suggestedSlot.date} {suggestedSlot.time}.
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleAcceptSuggestedSlot}
                className="bg-green-500 text-white py-2 px-4 rounded mr-2"
              >
                Accept
              </button>
              <button
                onClick={handleRejectSuggestedSlot}
                className="bg-red-500 text-white py-2 px-4 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Makeappointment;
