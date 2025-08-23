/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable no-undef */
/* eslint-disable no-new */

'use strict';

function bytes(bytes, decimals, kib, maxunit) {
  kib = kib || false;
  if (bytes === 0) return '0 B';
  if (Number.isNaN(parseFloat(bytes)) && !Number.isFinite(bytes)) return 'NaN';
  const k = kib ? 1024 : 1000;
  const dm = decimals != null && !Number.isNaN(decimals) && decimals >= 0 ? decimals : 2;
  const sizes = kib
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB', 'BiB']
    : ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB'];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  if (maxunit !== undefined) {
    const index = sizes.indexOf(maxunit);
    if (index !== -1) i = index;
  }
  // eslint-disable-next-line no-restricted-properties
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

new Vue({
  el: '#app',
  data: {
    authenticated: null,
    authenticating: false,
    password: null,
    requiresPassword: null,

    clients: null,
    clientsPersist: {},
    clientDelete: null,
    clientCreate: null,
    clientCreateName: '',
    clientEditName: null,
    clientEditNameId: null,
    clientEditAddress: null,
    clientEditAddressId: null,
    qrcode: null,

    currentRelease: null,
    latestRelease: null,

    // START: เพิ่มข้อมูลสำหรับหน้า page2
    fileToUpload: null,
    uploadStatus: '',
    uploadError: false,
    // END: เพิ่มข้อมูลสำหรับหน้า page2

    chartOptions: {
      chart: {
        background: 'transparent',
        type: 'bar',
        stacked: false,
        toolbar: {
          show: false,
        },
        animations: {
          enabled: false,
        },
      },
      colors: [
        '#DDDDDD', // rx
        '#EEEEEE', // tx
      ],
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        bar: {
          horizontal: false,
        },
      },
      xaxis: {
        labels: {
          show: false,
        },
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
        },
      },
      yaxis: {
        labels: {
          show: false,
        },
        min: 0,
      },
      tooltip: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      grid: {
        show: false,
        padding: {
          left: -10,
          right: 0,
          bottom: -15,
          top: -15,
        },
        column: {
          opacity: 0,
        },
        xaxis: {
          lines: {
            show: false,
          },
        },
      },
    },
  },
  methods: {
    dateTime: value => {
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(value);
    },
    async refresh({
      updateCharts = false,
    } = {}) {
      if (!this.authenticated) return;

      const clients = await this.api.getClients();
      this.clients = clients.map(client => {
        if (client.name.includes('@') && client.name.includes('.')) {
          client.avatar = `https://www.gravatar.com/avatar/${md5(client.name)}?d=blank`;
        }

        if (!this.clientsPersist[client.id]) {
          this.clientsPersist[client.id] = {};
          this.clientsPersist[client.id].transferRxHistory = Array(50).fill(0);
          this.clientsPersist[client.id].transferRxPrevious = client.transferRx;
          this.clientsPersist[client.id].transferTxHistory = Array(50).fill(0);
          this.clientsPersist[client.id].transferTxPrevious = client.transferTx;
        }

        if (updateCharts) {
          this.clientsPersist[client.id].transferRxCurrent = client.transferRx - this.clientsPersist[client.id].transferRxPrevious;
          this.clientsPersist[client.id].transferRxPrevious = client.transferRx;
          this.clientsPersist[client.id].transferTxCurrent = client.transferTx - this.clientsPersist[client.id].transferTxPrevious;
          this.clientsPersist[client.id].transferTxPrevious = client.transferTx;

          this.clientsPersist[client.id].transferRxHistory.push(this.clientsPersist[client.id].transferRxCurrent);
          this.clientsPersist[client.id].transferRxHistory.shift();

          this.clientsPersist[client.id].transferTxHistory.push(this.clientsPersist[client.id].transferTxCurrent);
          this.clientsPersist[client.id].transferTxHistory.shift();
        }

        client.transferTxCurrent = this.clientsPersist[client.id].transferTxCurrent;
        client.transferRxCurrent = this.clientsPersist[client.id].transferRxCurrent;

        client.transferTxHistory = this.clientsPersist[client.id].transferTxHistory;
        client.transferRxHistory = this.clientsPersist[client.id].transferRxHistory;
        client.transferMax = Math.max(...client.transferTxHistory, ...client.transferRxHistory);

        client.hoverTx = this.clientsPersist[client.id].hoverTx;
        client.hoverRx = this.clientsPersist[client.id].hoverRx;

        return client;
      });
    },
    login(e) {
      e.preventDefault();

      if (!this.password) return;
      if (this.authenticating) return;

      this.authenticating = true;
      this.api.createSession({
        password: this.password,
      })
        .then(async () => {
          const session = await this.api.getSession();
          this.authenticated = session.authenticated;
          this.requiresPassword = session.requiresPassword;
          return this.refresh();
        })
        .catch(err => {
          alert(err.message || err.toString());
        })
        .finally(() => {
          this.authenticating = false;
          this.password = null;
        });
    },
    logout(e) {
      e.preventDefault();

      this.api.deleteSession()
        .then(() => {
          this.authenticated = false;
          this.clients = null;
        })
        .catch(err => {
          alert(err.message || err.toString());
        });
    },
    createClient() {
      const name = this.clientCreateName;
      if (!name) return;

      this.api.createClient({ name })
        .catch(err => alert(err.message || err.toString()))
        .finally(() => this.refresh().catch(console.error));
    },
    deleteClient(client) {
      this.api.deleteClient({ clientId: client.id })
        .catch(err => alert(err.message || err.toString()))
        .finally(() => this.refresh().catch(console.error));
    },
    enableClient(client) {
      this.api.enableClient({ clientId: client.id })
        .catch(err => alert(err.message || err.toString()))
        .finally(() => this.refresh().catch(console.error));
    },
    disableClient(client) {
      this.api.disableClient({ clientId: client.id })
        .catch(err => alert(err.message || err.toString()))
        .finally(() => this.refresh().catch(console.error));
    },
    updateClientName(client, name) {
      this.api.updateClientName({ clientId: client.id, name })
        .catch(err => alert(err.message || err.toString()))
        .finally(() => this.refresh().catch(console.error));
    },
    updateClientAddress(client, address) {
      this.api.updateClientAddress({ clientId: client.id, address })
        .catch(err => alert(err.message || err.toString()))
        .finally(() => this.refresh().catch(console.error));
    },

    // START: เพิ่ม Method สำหรับหน้า page2
    downloadClientsCSV() {
        // สร้าง Header ของ CSV
        let csvContent = "data:text/csv;charset=utf-8,name,username,password\n";

        // วนลูป client ที่มีอยู่เพื่อสร้างแต่ละแถว
        this.clients.forEach(client => {
            const row = `${client.name},,\n`;
            csvContent += row;
        });

        // สร้างลิงก์ชั่วคราวเพื่อดาวน์โหลดไฟล์
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "clients.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    handleFileUpload(event) {
        this.fileToUpload = event.target.files[0];
        this.uploadStatus = ''; // รีเซ็ตสถานะเมื่อเลือกไฟล์ใหม่
        this.uploadError = false;
    },

    async uploadClientsCSV() {
        if (!this.fileToUpload) {
            this.uploadStatus = 'Please select a file first.';
            this.uploadError = true;
            return;
        }

        this.uploadStatus = 'Reading file...';
        this.uploadError = false;

        const reader = new FileReader();

        reader.onload = async (e) => {
            const text = e.target.result;
            const lines = text.split('\n').filter(line => line.trim() !== '');

            if (lines.length <= 1) {
                this.uploadStatus = 'Error: CSV file is empty or contains only a header.';
                this.uploadError = true;
                return;
            }

            const header = lines[0].split(',').map(h => h.trim());
            const nameIndex = header.indexOf('name');

            if (nameIndex === -1) {
                this.uploadStatus = 'Error: CSV file must contain a "name" column.';
                this.uploadError = true;
                return;
            }

            const clientsToCreate = lines.slice(1);
            let createdCount = 0;
            let failedCount = 0;

            this.uploadStatus = `Found ${clientsToCreate.length} clients to create. Starting process...`;

            for (const line of clientsToCreate) {
                const columns = line.split(',');
                const name = columns[nameIndex].trim();

                if (name) {
                    try {
                        // ใช้ this.api.createClient({ name }) ตามรูปแบบที่มีอยู่แล้ว
                        await this.api.createClient({ name });
                        createdCount++;
                    } catch (error) {
                        console.error(`Failed to create client ${name}:`, error);
                        failedCount++;
                    }
                }
            }

            let finalMessage = `Process finished.<br>Successfully created: ${createdCount} client(s).<br>Failed: ${failedCount} client(s).`;
            this.uploadStatus = finalMessage;
            this.uploadError = failedCount > 0;
            
            if (this.$refs.fileInput) {
              this.$refs.fileInput.value = null;
            }
            this.fileToUpload = null;
            
            // เรียก refresh() เพื่อดึงข้อมูล client ล่าสุดมาแสดงในหน้าแรก
            this.refresh().catch(console.error);
        };

        reader.onerror = () => {
            this.uploadStatus = 'Error reading the file.';
            this.uploadError = true;
        }

        reader.readAsText(this.fileToUpload);
    },
    // END: เพิ่ม Method สำหรับหน้า page2
  },
  filters: {
    bytes,
    timeago: value => {
      return timeago().format(value);
    },
  },
  mounted() {
    this.api = new API();
    this.api.getSession()
      .then(session => {
        this.authenticated = session.authenticated;
        this.requiresPassword = session.requiresPassword;
        this.refresh({
          updateCharts: true,
        }).catch(err => {
          alert(err.message || err.toString());
        });
      })
      .catch(err => {
        alert(err.message || err.toString());
      });

    setInterval(() => {
      this.refresh({
        updateCharts: true,
      }).catch(console.error);
    }, 1000);

    Promise.resolve().then(async () => {
      const currentRelease = await this.api.getRelease();
      const latestRelease = await fetch('https://weejewel.github.io/wg-easy/changelog.json')
        .then(res => res.json())
        .then(releases => {
          const releasesArray = Object.entries(releases).map(([version, changelog]) => ({
            version: parseInt(version, 10),
            changelog,
          }));
          releasesArray.sort((a, b) => {
            return b.version - a.version;
          });

          return releasesArray[0];
        });

      console.log(`Current Release: ${currentRelease}`);
      console.log(`Latest Release: ${latestRelease.version}`);

      if (currentRelease >= latestRelease.version) return;

      this.currentRelease = currentRelease;
      this.latestRelease = latestRelease;
    }).catch(console.error);
  },
});