import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';

export default function CentreModal({ centre, open, onClose }) {
  if (!centre) return null;

  const handlePrimaryAction = () => {
    const number = centre.whatsappNumber?.toString().replace(/\s/g, '');
    
    if (centre.contactType === 'Whatsapp' && number) {
      window.open(`https://wa.me/${number}`, '_blank');
    } else if (centre.contactType === 'LandLine' && number) {
      window.open(`tel:${number}`, '_blank');
    } else if (number) {
      // Fallback: use whatever number exists
      window.open(`tel:${number}`, '_blank');
    }
  };

  const handleWebsiteClick = () => {
    if (centre.websiteUrl) {
      window.open(centre.websiteUrl, '_blank');
    }
  };

  const hasPrimaryAction = centre.whatsappNumber;
  const hasWebsite = centre.websiteUrl;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          {centre.name}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            {centre.address}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {centre.postalCode}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1, display: 'flex', justifyContent: 'stretch', alignItems: 'stretch' }}>
        {hasPrimaryAction && (
          <Button
            variant="contained"
            onClick={handlePrimaryAction}
            startIcon={centre.contactType === 'Whatsapp' ? <WhatsAppIcon /> : <PhoneIcon />}
            sx={{ flex: '1 1 0', minWidth: 0, height: 'auto' }}
          >
            {centre.contactType === 'Whatsapp' ? 'WhatsApp' : 'Call'}
          </Button>
        )}
        
        {hasWebsite && (
          <Button
            variant="outlined"
            onClick={handleWebsiteClick}
            startIcon={<LanguageIcon />}
            sx={{ flex: '1 1 0', minWidth: 0, height: 'auto' }}
          >
            Visit Website
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
