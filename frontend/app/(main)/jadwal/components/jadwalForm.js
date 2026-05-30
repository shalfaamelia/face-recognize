'use client';

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';

const JadwalForm = ({ visible, onHide, onSubmit, form, setForm, editing, errors }) => {
  const hariOptions = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];

  const inputClass = (field) =>
    classNames('w-full mt-2', { 'p-invalid': errors?.[field] });

  return (
    <Dialog
      header={editing ? 'Edit Jadwal' : 'Tambah Jadwal'}
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
            placeholder="Masukkan kode (opsional)"
          />
        </div>

        <div>
          <label>Nama Mata Kuliah</label>
          <InputText
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className={inputClass('nama')}
            placeholder="Masukkan nama mata kuliah"
          />
          {errors?.nama && <small className="p-error">{errors.nama}</small>}
        </div>

        <div>
          <label>Dosen</label>
          <InputText
            value={form.dosen}
            onChange={(e) => setForm({ ...form, dosen: e.target.value })}
            className={inputClass('dosen')}
            placeholder="Masukkan nama dosen"
          />
          {errors?.dosen && <small className="p-error">{errors.dosen}</small>}
        </div>

        <div>
          <label>Kelas</label>
          <InputText
            value={form.kelas}
            onChange={(e) => setForm({ ...form, kelas: e.target.value })}
            className={inputClass('kelas')}
            placeholder="Masukkan kelas"
          />
          {errors?.kelas && <small className="p-error">{errors.kelas}</small>}
        </div>

        <div>
          <label>Hari</label>
          <Dropdown
            value={form.hari}
            options={hariOptions}
            onChange={(e) => setForm({ ...form, hari: e.value })}
            placeholder="Pilih Hari"
            className={inputClass('hari')}
          />
          {errors?.hari && <small className="p-error">{errors.hari}</small>}
        </div>

        <div>
          <label>Jam Mulai</label>
          <InputText
            value={form.jam_mulai}
            onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })}
            placeholder="HH:MM"
            className={inputClass('jam_mulai')}
          />
          {errors?.jam_mulai && <small className="p-error">{errors.jam_mulai}</small>}
        </div>

        <div>
          <label>Jam Selesai</label>
          <InputText
            value={form.jam_selesai}
            onChange={(e) => setForm({ ...form, jam_selesai: e.target.value })}
            placeholder="HH:MM"
            className={inputClass('jam_selesai')}
          />
          {errors?.jam_selesai && <small className="p-error">{errors.jam_selesai}</small>}
        </div>

        <div className="text-right pt-3">
          <Button type="submit" label="Simpan" icon="pi pi-save" />
        </div>
      </form>
    </Dialog>
  );
};

export default JadwalForm;