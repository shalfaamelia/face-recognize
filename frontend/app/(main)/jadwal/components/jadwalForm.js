'use client';

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';

const JadwalForm = ({
  visible,
  onHide,
  onSubmit,
  form,
  setForm,
  editing,
  errors,
  dosenOptions,
}) => {
  const hariOptions = [
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
    'Minggu',
  ];

  const inputClass = (field) =>
    classNames('w-full mt-2', { 'p-invalid': errors?.[field] });

  const dropdownClass = (field) =>
    classNames('w-full mt-2', { 'p-invalid': errors?.[field] });

  const handleDosenChange = (e) => {
    const selectedId = e.value;
    const selectedDosen = dosenOptions.find(
      (item) => Number(item.id) === Number(selectedId)
    );

    setForm({
      ...form,
      dosen_user_id: selectedId,
      dosen: selectedDosen?.nama || '',
      nip: selectedDosen?.nip || '',
    });
  };

  return (
    <Dialog
      header={editing ? 'Edit Jadwal Praktikum' : 'Tambah Jadwal Praktikum'}
      visible={visible}
      onHide={onHide}
      style={{ width: '40vw' }}
      modal
    >
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div>
          <label>Kode</label>
          <InputText
            value={form.kode || ''}
            onChange={(e) => setForm({ ...form, kode: e.target.value })}
            className="w-full mt-2"
            placeholder="Masukkan Kode (Opsional)"
          />
        </div>

        <div>
          <label>Nama Mata Kuliah</label>
          <InputText
            value={form.nama || ''}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className={inputClass('nama')}
            placeholder="Masukkan Nama Mata Kuliah"
          />
          {errors?.nama && <small className="p-error">{errors.nama}</small>}
        </div>

        <div>
          <label>Dosen</label>
          <Dropdown
            value={form.dosen_user_id || null}
            options={dosenOptions}
            optionLabel="nama"
            optionValue="id"
            onChange={handleDosenChange}
            placeholder="Pilih Dosen"
            filter
            showClear
            className={dropdownClass('dosen_user_id')}
            emptyMessage="Data dosen tidak tersedia"
          />
          {errors?.dosen_user_id && (
            <small className="p-error">{errors.dosen_user_id}</small>
          )}
        </div>

        <div>
          <label>NIP Dosen</label>
          <InputText
            value={form.nip || ''}
            className={inputClass('nip')}
            placeholder="NIP otomatis terisi"
            disabled
          />
          {errors?.nip && <small className="p-error">{errors.nip}</small>}
        </div>

        <div>
          <label>Program Studi</label>
          <InputText
            value={form.prodi || ''}
            onChange={(e) => setForm({ ...form, prodi: e.target.value })}
            className={inputClass('prodi')}
            placeholder="Masukkan Program Studi"
          />
          {errors?.prodi && <small className="p-error">{errors.prodi}</small>}
        </div>

        <div>
          <label>Kelas</label>
          <InputText
            value={form.kelas || ''}
            onChange={(e) => setForm({ ...form, kelas: e.target.value })}
            className={inputClass('kelas')}
            placeholder="Masukkan Kelas"
          />
          {errors?.kelas && <small className="p-error">{errors.kelas}</small>}
        </div>

        <div>
          <label>Hari</label>
          <Dropdown
            value={form.hari || null}
            options={hariOptions}
            onChange={(e) => setForm({ ...form, hari: e.value })}
            placeholder="Pilih Hari"
            className={dropdownClass('hari')}
          />
          {errors?.hari && <small className="p-error">{errors.hari}</small>}
        </div>

        <div>
          <label>Jam Mulai</label>
          <div style={{ display: 'grid', gridTemplateColumns: '4.5rem 4.5rem', gap: '0.75rem', marginTop: '0.5rem' }}>
            <InputText
              value={form.jam_mulai_jam || ''}
              onChange={(e) => setForm({ ...form, jam_mulai_jam: e.target.value })}
              placeholder="HH"
              className={inputClass('jam_mulai_jam')}
              style={{ width: '100%' }}
            />
            <InputText
              value={form.jam_mulai_menit || ''}
              onChange={(e) => setForm({ ...form, jam_mulai_menit: e.target.value })}
              placeholder="MM"
              className={inputClass('jam_mulai_menit')}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {errors?.jam_mulai_jam && (
              <small className="p-error">{errors.jam_mulai_jam}</small>
            )}
            {errors?.jam_mulai_menit && (
              <small className="p-error">{errors.jam_mulai_menit}</small>
            )}
          </div>
        </div>

        <div>
          <label>Jam Selesai</label>
          <div style={{ display: 'grid', gridTemplateColumns: '4.5rem 4.5rem', gap: '0.75rem', marginTop: '0.5rem' }}>
            <InputText
              value={form.jam_selesai_jam || ''}
              onChange={(e) => setForm({ ...form, jam_selesai_jam: e.target.value })}
              placeholder="HH"
              className={inputClass('jam_selesai_jam')}
              style={{ width: '100%' }}
            />
            <InputText
              value={form.jam_selesai_menit || ''}
              onChange={(e) => setForm({ ...form, jam_selesai_menit: e.target.value })}
              placeholder="MM"
              className={inputClass('jam_selesai_menit')}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {errors?.jam_selesai_jam && (
              <small className="p-error">{errors.jam_selesai_jam}</small>
            )}
            {errors?.jam_selesai_menit && (
              <small className="p-error">{errors.jam_selesai_menit}</small>
            )}
          </div>
        </div>

        <div className="text-right pt-3">
          <Button type="submit" label="Simpan" icon="pi pi-save" />
        </div>
      </form>
    </Dialog>
  );
};

export default JadwalForm;
