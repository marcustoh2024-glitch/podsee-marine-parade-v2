import { useState, useEffect, useRef } from 'react'
import './ChipSelector.css'

function ChipSelector({ label, options, value, onChange, icon }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (option) => {
    onChange(option)
    setIsOpen(false)
  }

  return (
    <div className="chip-selector" ref={containerRef}>
      <div 
        className={`selector-field ${value ? 'selected' : ''} ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="selector-icon">{icon}</span>
        <span className="selector-text">{value || label}</span>
        <span className={`selector-arrow ${isOpen ? 'rotated' : ''}`}>▼</span>
      </div>
      
      {isOpen && (
        <div className="chips-container">
          {options.map((option) => (
            <button
              key={option}
              className={`chip ${value === option ? 'chip-selected' : ''}`}
              onClick={() => handleSelect(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChipSelector
