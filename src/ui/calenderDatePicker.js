import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { Calendar, ChevronDown } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setDateRange } from "../store/reducer/storeReducer";

const DEFAULT_START = new Date("2025-03-01");
const DEFAULT_END = new Date("2025-04-30");

const DateRangePickerDropdown = () => {
  const dispatch = useDispatch();
  // const storedRange = useSelector((state) => state.store.store);
  const storedRange = useSelector((state) => state.store.dateRange);

  const initialStart = storedRange?.startDate ? new Date(storedRange.startDate) : DEFAULT_START;
  const initialEnd = storedRange?.endDate ? new Date(storedRange.endDate) : DEFAULT_END;

  const [tempRange, setTempRange] = useState([initialStart, initialEnd]);
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  const [start, end] = tempRange;

  // ⛔ Close dropdown on outside click and reset tempRange to stored range
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setTempRange([
          storedRange?.startDate ? new Date(storedRange.startDate) : DEFAULT_START,
          storedRange?.endDate ? new Date(storedRange.endDate) : DEFAULT_END,
        ]);
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [storedRange]);


  const handleDateChange = (update) => {
    setTempRange(update);
    if (update[0] && update[1]) {
      dispatch(
        setDateRange({
          startDate: format(update[0], "yyyy-MM-dd"),
          endDate: format(update[1], "yyyy-MM-dd"),
        })
      );
      setIsOpen(false); // Close after both dates selected
    }
  };

  return (
    <div className="dropdown" style={{ position: "relative" }} ref={pickerRef}>
      <button
        className="btn btn-outline"
        style={{ fontSize: "10px" }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar size={16} />
        <span style={{ margin: "0 5px" }}>
          {start ? format(start, "yyyy-MM-dd") : "Start"} -{" "}
          {end ? format(end, "yyyy-MM-dd") : "End"}
        </span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            zIndex: 10,
            marginTop: "8px",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            borderRadius: "8px",
          }}
        >
          <DatePicker
            selectsRange
            startDate={tempRange[0]}
            endDate={tempRange[1]}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            inline
          />
        </div>
      )}
    </div>
  );
};

export default DateRangePickerDropdown;
