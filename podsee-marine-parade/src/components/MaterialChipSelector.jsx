import { useState } from 'react'
import { 
  Box, 
  Paper, 
  Chip, 
  Collapse, 
  ButtonBase,
  Typography,
  ClickAwayListener
} from '@mui/material'
import { ExpandMore, MenuBook } from '@mui/icons-material'

function MaterialChipSelector({ label, options, value, onChange, disabled = false, helperText = '' }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (option) => {
    if (disabled) return;
    onChange(option)
    setIsOpen(false)
  }

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen)
  }

  const handleClickAway = () => {
    if (isOpen) {
      setIsOpen(false)
    }
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ mb: 1.5 }}>
        <Paper
          elevation={2}
          component={ButtonBase}
          onClick={handleToggle}
          disabled={disabled}
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderRadius: 2,
            bgcolor: value ? '#d4c4b0' : 'background.paper',
            border: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
            ...(!disabled && {
              '&:hover': {
                elevation: 4,
                bgcolor: value ? '#e0d4c4' : '#f3f0e8',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0px)',
                elevation: 1,
              },
            }),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <MenuBook sx={{ color: value ? '#3d3d3d' : '#666666', fontSize: 20 }} />
            <Typography
              variant="body1"
              sx={{
                color: value ? '#3d3d3d' : '#666666',
                fontWeight: value ? 600 : 500,
                fontSize: '14px',
              }}
            >
              {value || label}
            </Typography>
          </Box>
          <ExpandMore
            sx={{
              color: value ? '#3d3d3d' : '#666666',
              fontSize: 20,
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </Paper>

        <Collapse 
          in={isOpen} 
          timeout={300}
          easing={{
            enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
            exit: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              mt: 1,
              p: 2,
              borderRadius: 2,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.75,
              bgcolor: '#ffffff',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {options.map((option) => (
              <Chip
                key={option}
                label={option}
                onClick={() => handleSelect(option)}
                color="primary"
                variant={value === option ? 'filled' : 'outlined'}
                sx={{
                  fontSize: '11px',
                  fontWeight: 500,
                  height: '26px',
                  borderRadius: '13px',
                  px: 0.4,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  ...(value === option ? {
                    bgcolor: '#c0b0a0',
                    color: '#3d3d3d',
                    fontWeight: 600,
                    border: 'none',
                    '&:hover': {
                      bgcolor: '#b0a090',
                    },
                  } : {
                    borderColor: 'transparent',
                    bgcolor: '#e8e8e8',
                    color: '#666666',
                    '&:hover': {
                      bgcolor: '#d8d8d8',
                    },
                  }),
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              />
            ))}
          </Paper>
        </Collapse>
        
        {helperText && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              ml: 2,
              color: '#888888',
              fontSize: '11px',
            }}
          >
            {helperText}
          </Typography>
        )}
      </Box>
    </ClickAwayListener>
  )
}

export default MaterialChipSelector
