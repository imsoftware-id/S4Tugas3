#NAMA : IMAM MA'SUM
#NIM  : 051146712
#install.packages(c("shiny", "ggplot2", "plotly", "DT", "readr", "dplyr", "readxl"))

library(shiny)
library(ggplot2)
library(plotly)
library(DT)
library(dplyr)
library(readxl)

# --- 1. MEMBACA DATA Excel---
file_path <- "./weather.xlsx" 

if (!file.exists(file_path)) {
  stop(paste("File 'weather.xlsx' tidak ditemukan pada path:", file_path))
}

# Membaca file Excel (header di baris ke-2, skip = 1)
data_raw <- read_excel(file_path, skip = 1)

# Membersihkan nama kolom (mengganti spasi atau karakter khusus dengan titik)
names(data_raw) <- make.names(names(data_raw), unique = TRUE)

# memastikan MinTemp, MaxTemp, dan Rainfall masuk ke pilihan plot
data_raw <- data_raw %>% 
  mutate(
    # Konversi kolom yang seharusnya numerik
    MinTemp = as.numeric(MinTemp),
    MaxTemp = as.numeric(MaxTemp),
    Rainfall = as.numeric(Rainfall),
    # Konversi kolom kategorikal menjadi faktor (untuk keamanan)
    RainToday = as.factor(RainToday),
    RainTomorrow = as.factor(RainTomorrow)
  )

# Tambahkan kolom 'Index' (Nomor Urut) sebagai sumbu X untuk plot garis/scatter
data_raw$Index <- 1:nrow(data_raw) 

# Filter kolom numerik yang dapat dipilih pengguna
numeric_cols <- names(data_raw)[sapply(data_raw, is.numeric)]
# Kecualikan Index dan kolom target lain dari pilihan variabel Y
numeric_cols <- setdiff(numeric_cols, c("RISK_MM", "Index"))

data_clean <- data_raw

# --- 2. UI (User Interface) ---
ui <- fluidPage(
  
  titlePanel("☀️ Aplikasi Visualisasi Data Cuaca | IMAM MA'SUM 051146712"),
  
  hr(),
  
  sidebarLayout(
    sidebarPanel(
      
      # 1. Input untuk memilih Variabel
      selectInput("variable", "Pilih Variabel untuk Divisualisasikan", 
                  choices = numeric_cols, 
                  selected = if("MaxTemp" %in% numeric_cols) "MaxTemp" else numeric_cols[1]),
      
      # 2. Input untuk memilih Jenis Plot (a, b, c, d)
      radioButtons("plot_type", "Pilih Jenis Visualisasi:",
                   choices = list(
                     "a. Scatter Plot Interaktif" = "scatter",
                     "b. Line Plot Interaktif" = "line",
                     "c. Bar Plot Interaktif" = "bar",
                     "d. Tabel Data Penuh" = "table"
                   ),
                   selected = "scatter"
      ),
      
      # Keterangan
      conditionalPanel(
        condition = "input.plot_type == 'bar'",
        p(em("Bar plot akan menampilkan nilai rata-rata dari variabel yang dipilih per arah angin"))
      ),
      width = 3
    ),
    
    mainPanel(
      tabsetPanel(id = "tabs",
                  tabPanel("Visualisasi Plot", value = "plot_tab", br(), plotlyOutput("interactive_plot")),
                  tabPanel("Tabel Data", value = "table_tab", br(), DTOutput("data_table"))
      )
    )
  )
)

# --- 3. SERVER APlikasi ---
server <- function(input, output, session) {
  
  # Reaktif: Data yang sudah diagregasi untuk Bar Plot (C)
  data_for_bar <- reactive({
    req(input$variable)
    data_clean %>%
      # Filter baris NA pada variabel Y dan WindGustDir
      filter(!is.na(.data[[input$variable]]) & !is.na(WindGustDir)) %>%
      group_by(WindGustDir) %>%
      summarise(mean_value = mean(.data[[input$variable]], na.rm = TRUE), .groups = 'drop')
  })
  
  # Output: Plot Interaktif (a, b, c)
  output$interactive_plot <- renderPlotly({
    req(input$variable)
    
    # Data yang sudah difilter NA untuk Scatter/Line Plot
    plot_data <- data_clean %>%
      filter(!is.na(.data[[input$variable]])) 
    
    # --- a & b: Scatter dan Line Plot ---
    if (input$plot_type %in% c("scatter", "line")) {
      
      p <- ggplot(plot_data, aes(x = Index, y = .data[[input$variable]],
                                 text = paste("Index:", Index, 
                                              "<br>Nilai:", .data[[input$variable]]))) +
        labs(x = "Indeks Data", y = input$variable) + 
        theme_minimal()
      
      if (input$plot_type == "scatter") {
        p <- p + geom_point(alpha = 0.6, color = "blue") + 
          ggtitle(paste("a. Scatter Plot:", input$variable))
      } else { 
        # Perbaikan: Tambahkan group = 1 dan warna skyblue
        p <- p + geom_line(aes(group = 1), color = "skyblue") + # <-- Warna skyblue
          ggtitle(paste("b. Line Plot:", input$variable))
      }
      
      ggplotly(p, tooltip = "text")
      
      # --- c: Bar Plot ---
    } else if (input$plot_type == "bar") {
      bar_data <- data_for_bar()
      
      p <- ggplot(bar_data, aes(x = WindGustDir, y = mean_value,
                                text = paste("Arah:", WindGustDir, 
                                             "<br>Rata-rata:", round(mean_value, 2)))) +
        geom_bar(stat = "identity", fill = "orange") +
        labs(x = "Arah Angin (WindGustDir)", y = paste("Rata-rata", input$variable)) +
        ggtitle(paste("c. Bar Plot Rata-rata", input$variable)) +
        theme_minimal() + 
        theme(axis.text.x = element_text(angle = 45, hjust = 1))
      
      ggplotly(p, tooltip = "text")
    }
  })
  
  # Output: Tabel Data (d)
  output$data_table <- renderDT({
    datatable(data_clean, options = list(pageLength = 10, scrollX = TRUE), 
              caption = "d. Tabel Data Penuh")
  })
  
  # Logika pindah tab otomatis
  observeEvent(input$plot_type, {
    if(input$plot_type == "table") {
      updateTabsetPanel(session, "tabs", selected = "table_tab")
    } else {
      updateTabsetPanel(session, "tabs", selected = "plot_tab")
    }
  })
}

# Jalankan Aplikasi shinyApp
shinyApp(ui, server)