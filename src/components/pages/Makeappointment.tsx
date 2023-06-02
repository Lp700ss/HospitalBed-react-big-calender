import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { SectionWrapper } from '../hoc';
import { slideIn } from '../utils/motion';
import { motion } from 'framer-motion';

type Appointment = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
};

const localizer = momentLocalizer(moment);

const Makeappointment: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [newAppointment, setNewAppointment] = useState<Appointment>({
    id: 0,
    date: '',
    startTime: '',
    endTime: '',
    description: '',
  });
  const [suggestedSlots, setSuggestedSlots] = useState<Appointment[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showModal, setShowModal] = useState(false);

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

  const isSlotAvailable = (slotDate: string, slotStartTime: string, slotEndTime: string): boolean => {
    const conflictingAppointment = appointments.find(
      appointment =>
        appointment.date === slotDate &&
        ((appointment.startTime <= slotStartTime && appointment.endTime > slotStartTime) ||
          (appointment.startTime >= slotStartTime && appointment.startTime < slotEndTime))
    );

    return !conflictingAppointment;
  };

  const handleAddAppointment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const slotDate = moment(newAppointment.date).format('YYYY-MM-DD');
    const slotStartTime = moment(newAppointment.startTime, 'HH:mm').format('HH:mm');
    const slotEndTime = moment(newAppointment.endTime, 'HH:mm').format('HH:mm');
    const currentDateTime = moment();

    if (!slotDate || !slotStartTime || !slotEndTime || !newAppointment.description) {
      alert('Please fill in all the fields.');
      return;
    }

    const selectedDateTime = moment(`${slotDate} ${slotStartTime}`, 'YYYY-MM-DD HH:mm');

    if (selectedDateTime.isBefore(currentDateTime)) {
      alert('Cannot book appointments for past dates and times.');
      return;
    }

    if (isSlotAvailable(slotDate, slotStartTime, slotEndTime)) {
      setAppointments([...appointments, { ...newAppointment, id: Date.now() }]);
      setNewAppointment({ id: 0, date: '', startTime: '', endTime: '', description: '' });
    } else {
      const suggestedSlots: Appointment[] = [];
      let suggestedSlotStartTime = currentDateTime.clone().startOf('hour');
      let suggestedSlotEndTime = suggestedSlotStartTime.clone().add(30, 'minutes');

      while (
        suggestedSlots.length < 3 &&
        suggestedSlotStartTime.isSameOrBefore(currentDateTime.clone().add(4, 'hours'), 'minute')
      ) {
        if (isSlotAvailable(slotDate, suggestedSlotStartTime.format('HH:mm'), suggestedSlotEndTime.format('HH:mm'))) {
          suggestedSlots.push({
            id: Date.now(),
            date: slotDate,
            startTime: suggestedSlotStartTime.format('HH:mm'),
            endTime: suggestedSlotEndTime.format('HH:mm'),
            description: newAppointment.description,
          });
        }

        suggestedSlotStartTime.add(30, 'minutes');
        suggestedSlotEndTime.add(30, 'minutes');
      }

      setSuggestedSlots(suggestedSlots);
      setShowModal(true);
    }
  };

  const handleAcceptSuggestedSlot = (slot: Appointment) => {
    setAppointments([...appointments, slot]);
    setNewAppointment({ id: 0, date: '', startTime: '', endTime: '', description: '' });
    setSuggestedSlots([]);
    setShowModal(false);
  };

  const handleRejectSuggestedSlots = () => {
    setSuggestedSlots([]);
    setShowModal(false);
  };

  const handleToggleView = () => {
    setViewMode(prevMode => (prevMode === 'calendar' ? 'list' : 'calendar'));
  };

  return (
    <div className="-mt-[8rem] xl:flex-row flex-col-reverse flex gap-10 overflow-hidden pt-2.5">
      <motion.div variants={slideIn('left', 'tween', 0.2, 1)} className="flex-[0.85] bg-zinc-100 p-8 rounded-2xl">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4 text-center">Manage Appointments</h1>
          <form onSubmit={handleAddAppointment}>
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
                required
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="startTime" className="mb-2">
                Start Time:
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={newAppointment.startTime}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2"
                required
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="endTime" className="mb-2">
                End Time:
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={newAppointment.endTime}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2"
                required
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
                required
              ></textarea>
            </div>
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
              Add Appointment
            </button>
          </form>

          <h2 className="text-xl font-bold mt-8 text-center">Appointments</h2>
          <motion.div variants={slideIn('right', 'tween', 0.2, 1)} className="flex-[0.15] p-8">
        <div className="sticky top-[8rem]">
        <button className="bg-blue-500 text-white py-2 px-4 rounded mb-4 left-3" onClick={handleToggleView}>
      {viewMode === 'calendar' ? 'Switch to List View' : 'Switch to Calendar View'}
    </button>
        </div>
      </motion.div>
          {viewMode === 'calendar' ? (
            <Calendar
              localizer={localizer}
              events={appointments.map(appointment => ({
                start: new Date(appointment.date + ' ' + appointment.startTime),
                end: new Date(appointment.date + ' ' + appointment.endTime),
                title: appointment.description,
              }))}
              views={['month', 'week']}
              step={60}
              timeslots={2}
              defaultView="week"
              defaultDate={new Date()}
              min={new Date(0, 0, 0, 8, 0, 0)}
              max={new Date(0, 0, 0, 23, 0, 0)}
              length={2}
              showMultiDayTimes
              selectable={false}
            />
          ) : (
            <ul>
              {appointments.map(appointment => (
                <li key={appointment.id}>
                  {appointment.date} {appointment.startTime}-{appointment.endTime}: {appointment.description}
                </li>
              ))}
            </ul>
          )}

          {suggestedSlots.length > 0 && (
            <>
              <h2 className="text-xl font-bold mt-8">Suggested Slots</h2>
              <ul>
                {suggestedSlots.map(slot => (
                  <li key={slot.id}>
                    {slot.date} {slot.startTime}-{slot.endTime}: {slot.description}
                    <button className="bg-blue-500 text-white py-2 px-4 rounded mx-2" onClick={() => handleAcceptSuggestedSlot(slot)}>
                      Accept
                    </button>
                  </li>
                ))}
              </ul>
              <button className="bg-red-500 text-white py-2 px-4 rounded mt-4" onClick={handleRejectSuggestedSlots}>
                Reject All
              </button>
            </>
          )}
        </div>
      </motion.div>
   

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Suggested Slots</h2>
            <ul>
              {suggestedSlots.map(slot => (
                <li key={slot.id}>
                  {slot.date} {slot.startTime}-{slot.endTime}: {slot.description}
                  <button className="bg-blue-500 text-white py-2 px-4 rounded mx-2" onClick={() => handleAcceptSuggestedSlot(slot)}>
                    Accept
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-4">
              <button className="bg-red-500 text-white py-2 px-4 rounded" onClick={handleRejectSuggestedSlots}>
                Reject All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionWrapper(Makeappointment, 'makeappointment');
