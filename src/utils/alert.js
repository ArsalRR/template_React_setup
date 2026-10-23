import Swal from 'sweetalert2';

const showAlert = (title, text, icon) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    Swal.fire({
        title,
        text,
        icon,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f3f4f6' : '#111827',
        iconColor:
            icon === 'success'
                ? '#22c55e'
                : icon === 'error'
                ? '#ef4444'
                : '#f59e0b',
        didOpen: () => {
            const progressBar = document.querySelector(
                '.swal2-timer-progress-bar'
            );

            if (progressBar) {
                progressBar.style.backgroundColor = isDarkMode
                    ? '#3b82f6'
                    : '#2563eb';
            }
        },
    });
};

export const SuccessAlert = (
    title = 'Berhasil',
    text = ''
) => {
    showAlert(title, text, 'success');
};

export const ErrorAlert = (
    title = 'Gagal',
    text = 'Terjadi kesalahan'
) => {
    showAlert(title, text, 'error');
};

export const WarningAlert = (
    title = 'Peringatan',
    text = 'Data Tidak Ada/Data Tidak Ditemukan'
) => {
    showAlert(title, text, 'warning');
};

export const ConfirmAlert = async (
    title = 'Konfirmasi',
    text = 'Apakah Anda yakin?'
) => {
    const isDarkMode = document.documentElement.classList.contains('dark');

    const result = await Swal.fire({
        title,
        text,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#ef4444',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f3f4f6' : '#111827',
        iconColor: '#3b82f6',
    });

    return result.isConfirmed;
};