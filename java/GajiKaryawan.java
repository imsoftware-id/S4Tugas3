import java.util.Scanner;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;

public class GajiKaryawan {
    
    // Fungsi untuk format Rupiah tanpa koma
    public static String formatRupiah(double angka) {
        DecimalFormatSymbols simbol = new DecimalFormatSymbols();
        simbol.setGroupingSeparator('.');
        simbol.setDecimalSeparator(',');

        DecimalFormat df = new DecimalFormat("###,###", simbol);
        return "Rp " + df.format(angka);
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        int[] gajiGolongan = {5000000, 6500000, 9500000};
        int[] persenLembur = {30, 32, 34, 36, 38};

        System.out.print("Masukkan Golongan (A/B/C): ");
        String gol = input.next().toUpperCase();

        System.out.print("Masukkan Jam Lembur: ");
        int jam = input.nextInt();

        int indexGol = -1;

        if (gol.equals("A")) indexGol = 0;
        else if (gol.equals("B")) indexGol = 1;
        else if (gol.equals("C")) indexGol = 2;
        else {
            System.out.println("Golongan tidak valid!");
            return;
        }

        int gajiPokok = gajiGolongan[indexGol];
        double gajiLembur = 0;

        if (jam == 1) {
            gajiLembur = gajiPokok * persenLembur[0] / 100.0;
        } else if (jam == 2) {
            gajiLembur = gajiPokok * persenLembur[1] / 100.0;
        } else if (jam == 3) {
            gajiLembur = gajiPokok * persenLembur[2] / 100.0;
        } else if (jam == 4) {
            gajiLembur = gajiPokok * persenLembur[3] / 100.0;
        } else if (jam >= 5) {
            gajiLembur = gajiPokok * persenLembur[4] / 100.0;
        }

        double totalGaji = gajiPokok + gajiLembur;

        System.out.println("==============================");
        System.out.println("Golongan       : " + gol);
        System.out.println("Gaji Pokok     : " + formatRupiah(gajiPokok));
        System.out.println("Jam Lembur     : " + jam);
        System.out.println("Gaji Lembur    : " + formatRupiah(gajiLembur));
        System.out.println("Total Gaji     : " + formatRupiah(totalGaji));
    }
}
