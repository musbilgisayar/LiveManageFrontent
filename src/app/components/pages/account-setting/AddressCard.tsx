'use client';

import React, { useState, ChangeEvent } from 'react';
import {
  Box,
  Button,
  CardContent,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid'; // ✅ senin grid yapına uygun
import BlankCard from '../../shared/BlankCard';
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel';
import CustomTextField from '../../forms/theme-elements/CustomTextField';
import CustomSelect from '../../forms/theme-elements/CustomSelect';

// 🌍 Ülkeler (ISO 3166-1 alpha-2 formatında)
const countries = [
  { code: 'TR', name: 'Türkiye' },
  { code: 'DE', name: 'Almanya' },
  { code: 'CH', name: 'İsviçre' },
  { code: 'GB', name: 'Birleşik Krallık' },
  { code: 'US', name: 'Amerika Birleşik Devletleri' },
  { code: 'FR', name: 'Fransa' },
  { code: 'IT', name: 'İtalya' },
];

const AddressCard = () => {
  const [address, setAddress] = useState({
    streetLine1: '',
    streetLine2: '',
    city: '',
    state: '',
    postalCode: '',
    countryCode: 'TR',
    latitude: '',
    longitude: '',
  });

  // 🔹 Text alanları için değişim
  const handleChange = (
    field: string,
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAddress((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // 🔹 Select alanları için değişim
  const handleSelectChange = (
    field: string,
    e: React.ChangeEvent<{ value: unknown }>
  ) => {
    setAddress((prev) => ({ ...prev, [field]: e.target.value as string }));
  };

  const handleSave = () => {
    
    // await api.post(`/api/v1.0/tr/account/update-address`, address);
  };

  return (
    <BlankCard>
      <CardContent>
        <Typography variant="h5" mb={1}>
          Adres ve Konum Bilgileri
        </Typography>
        <Typography color="textSecondary" mb={3}>
          Uluslararası adres formatına göre adresinizi düzenleyebilir ve konum bilgilerinizi ekleyebilirsiniz.
        </Typography>

        <form>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="country">Ülke</CustomFormLabel>
              <CustomSelect
                id="country"
                fullWidth
                value={address.countryCode}
                onChange={(e: React.ChangeEvent<{ value: unknown }>) =>
                  handleSelectChange('countryCode', e)
                }
              >
                {countries.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.name}
                  </MenuItem>
                ))}
              </CustomSelect>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="city">Şehir</CustomFormLabel>
              <CustomTextField
                id="city"
                fullWidth
                value={address.city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange('city', e)
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="state">İlçe / Bölge</CustomFormLabel>
              <CustomTextField
                id="state"
                fullWidth
                value={address.state}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange('state', e)
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="postalCode">Posta Kodu</CustomFormLabel>
              <CustomTextField
                id="postalCode"
                fullWidth
                value={address.postalCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange('postalCode', e)
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="streetLine1">Adres Satırı 1</CustomFormLabel>
              <CustomTextField
                id="streetLine1"
                fullWidth
                value={address.streetLine1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange('streetLine1', e)
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="streetLine2">Adres Satırı 2</CustomFormLabel>
              <CustomTextField
                id="streetLine2"
                fullWidth
                value={address.streetLine2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange('streetLine2', e)
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="latitude">Enlem (Latitude)</CustomFormLabel>
              <CustomTextField
                id="latitude"
                fullWidth
                value={address.latitude}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange('latitude', e)
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="longitude">Boylam (Longitude)</CustomFormLabel>
              <CustomTextField
                id="longitude"
                fullWidth
                value={address.longitude}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange('longitude', e)
                }
              />
            </Grid>
          </Grid>
        </form>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'end' }} mt={3}>
          <Button size="large" variant="contained" color="primary" onClick={handleSave}>
            Kaydet
          </Button>
          <Button size="large" variant="text" color="error">
            İptal
          </Button>
        </Stack>
      </CardContent>
    </BlankCard>
  );
};

export default AddressCard;
