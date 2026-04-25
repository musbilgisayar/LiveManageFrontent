import React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import { Grid } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/system';

// bileşenler
import BlankCard from '../../shared/BlankCard';
import CustomTextField from '../../forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel';
import CustomSelect from '../../forms/theme-elements/CustomSelect';
 

// konum seçenekleri
const locations = [
  { value: 'tr', label: 'Türkiye' },
  { value: 'us', label: 'Amerika Birleşik Devletleri' },
  { value: 'uk', label: 'Birleşik Krallık' },
  { value: 'de', label: 'Almanya' },
  { value: 'fr', label: 'Fransa' },
];

// para birimleri
const currencies = [
  { value: 'try', label: 'Türk Lirası (₺)' },
  { value: 'usd', label: 'ABD Doları ($)' },
  { value: 'eur', label: 'Euro (€)' },
  { value: 'gbp', label: 'İngiliz Sterlini (£)' },
];

const AccountTab = () => {
  const [location, setLocation] = React.useState('tr');
  const [currency, setCurrency] = React.useState('try');

  const handleChange1 = (event: any) => setLocation(event.target.value);
  const handleChange2 = (event: any) => setCurrency(event.target.value);

  return (
    <Grid container spacing={3}>
      {/* 🟢 Profil Fotoğrafı Değiştirme */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <BlankCard>
          <CardContent>
            <Typography variant="h5" mb={1}>
              Profil Fotoğrafını Değiştir
            </Typography>
            <Typography color="textSecondary" mb={3}>
              Buradan profil fotoğrafınızı değiştirebilirsiniz.
            </Typography>

            <Box textAlign="center" display="flex" justifyContent="center">
              <Box>
                <Avatar
                  src="/images/profile/user-1.jpg"
                  alt="Kullanıcı"
                  sx={{ width: 120, height: 120, margin: '0 auto' }}
                />
                <Stack direction="row" justifyContent="center" spacing={2} my={3}>
                  <Button variant="contained" color="primary" component="label">
                    Yükle
                    <input hidden accept="image/*" multiple type="file" />
                  </Button>
                  <Button variant="outlined" color="error">
                    Sıfırla
                  </Button>
                </Stack>
                <Typography variant="subtitle1" color="textSecondary" mb={4}>
                  Yalnızca JPG, GIF veya PNG dosyaları. Maksimum boyut: 800KB
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </BlankCard>
      </Grid>

      {/* 🟡 Şifre Değiştirme */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <BlankCard>
          <CardContent>
            <Typography variant="h5" mb={1}>
              Şifreyi Değiştir
            </Typography>
            <Typography color="textSecondary" mb={3}>
              Şifrenizi değiştirmek için aşağıdaki alanları doldurun.
            </Typography>
            <form>
              <CustomFormLabel htmlFor="text-cpwd">Mevcut Şifre</CustomFormLabel>
              <CustomTextField id="text-cpwd" variant="outlined" fullWidth type="password" />

              <CustomFormLabel htmlFor="text-npwd">Yeni Şifre</CustomFormLabel>
              <CustomTextField id="text-npwd" variant="outlined" fullWidth type="password" />

              <CustomFormLabel htmlFor="text-conpwd">Yeni Şifre (Tekrar)</CustomFormLabel>
              <CustomTextField id="text-conpwd" variant="outlined" fullWidth type="password" />
            </form>
          </CardContent>
        </BlankCard>
      </Grid>

      {/* 🔵 Kişisel Bilgiler */}
      <Grid size={12}>
        <BlankCard>
          <CardContent>
            <Typography variant="h5" mb={1}>
              Kişisel Bilgiler
            </Typography>
            <Typography color="textSecondary" mb={3}>
              Kişisel bilgilerinizi buradan düzenleyebilir ve kaydedebilirsiniz.
            </Typography>

            <form>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="text-name">Ad Soyad</CustomFormLabel>
                  <CustomTextField id="text-name" value="Ahmet Yılmaz" fullWidth />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="text-store-name">Mağaza Adı</CustomFormLabel>
                  <CustomTextField id="text-store-name" value="Maxima Studio" fullWidth />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="text-location">Ülke</CustomFormLabel>
                  <CustomSelect fullWidth id="text-location" value={location} onChange={handleChange1}>
                    {locations.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </CustomSelect>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="text-currency">Para Birimi</CustomFormLabel>
                  <CustomSelect fullWidth id="text-currency" value={currency} onChange={handleChange2}>
                    {currencies.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </CustomSelect>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="text-email">E-posta Adresi</CustomFormLabel>
                  <CustomTextField id="text-email" value="info@modernize.com" fullWidth />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="text-phone">Telefon Numarası</CustomFormLabel>
                  <CustomTextField id="text-phone" value="+90 555 123 45 67" fullWidth />
                </Grid>

                <Grid size={12}>
                  <CustomFormLabel htmlFor="text-address">Adres</CustomFormLabel>
                  <CustomTextField
                    id="text-address"
                    value="İstiklal Cd. No:14, Beyoğlu / İstanbul"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </BlankCard>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'end' }} mt={3}>
          <Button size="large" variant="contained" color="primary">
            Kaydet
          </Button>
          <Button size="large" variant="text" color="error">
            İptal
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default AccountTab;
