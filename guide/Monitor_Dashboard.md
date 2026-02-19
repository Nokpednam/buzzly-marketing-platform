# Monitor Dashboard Documentation

เอกสารฉบับนี้อธิบายโครงสร้างและหน้าที่ของตาราง (Database Tables) ที่เกี่ยวข้องกับการแสดงผลในหน้า Monitor Dashboard

## <u>server</u>
&nbsp;&nbsp;&nbsp;&nbsp;เพื่อ: เก็บข้อมูลสถานะของเครื่องเซิร์ฟเวอร์ (เช่น CPU, Memory, Status) เพื่อนำมาแสดงผลใน Tab "Servers" และคำนวณ System Status รวม

## <u>data_pipeline</u>
&nbsp;&nbsp;&nbsp;&nbsp;เพื่อ: เก็บสถานะการรัน Data Pipeline (ETL/Cron Jobs) ว่าสำเร็จหรือล้มเหลว และเวลาที่รันล่าสุด เพื่อแสดงใน Tab "Data Pipelines"

## <u>external_api_status</u>
&nbsp;&nbsp;&nbsp;&nbsp;JOIN: `external_api_status.platform_id` &rarr; `platforms.id`<br>
&nbsp;&nbsp;&nbsp;&nbsp;เพื่อ: ดึงชื่อแพลตฟอร์ม (`name`) มาแสดงคู่กับสถานะ API (เช่น Facebook, Google Ads) ในการ์ดแสดงผล

## <u>error_logs</u>
&nbsp;&nbsp;&nbsp;&nbsp;เพื่อ: เก็บประวัติ Error และระดับความรุนแรง (Critical, Warning, Info) เพื่อนำมานับจำนวนและแสดงสถิติบน Dashboard (Error Summary)

## <u>platforms</u> (Lookup Table)
&nbsp;&nbsp;&nbsp;&nbsp;เพื่อ: เก็บรายชื่อแพลตฟอร์มกลาง (Master Data) เช่น Facebook, Google Ads, TikTok ที่ไม่ค่อยมีการเปลี่ยนแปลง<br>
&nbsp;&nbsp;&nbsp;&nbsp;ประโยชน์: ช่วยให้ตารางอื่น (`external_api_status`) เก็บแค่ `id` อ้างอิง ไม่ต้องเก็บชื่อซ้ำๆ และหากต้องการเปลี่ยนชื่อแพลตฟอร์ม ก็แก้ที่นี่ที่เดียว

---

## <u>Functions (useAdminMonitor.tsx)</u>

### `useServerHealth()`
&nbsp;&nbsp;&nbsp;&nbsp;ดึงข้อมูลสถานะและทรัพยากร (CPU, RAM) ของเซิร์ฟเวอร์ทั้งหมดแบบเรียลไทม์ เพื่อตรวจสอบว่าเครื่องไหนโหลดหนักหรือมีปัญหา (`critical`) พร้อมแสดง IP Address และ Hostname

### `useDataPipelines()`
&nbsp;&nbsp;&nbsp;&nbsp;ดึงรายการและสถานะการทำงานของ Data Pipelines (ETL) ทั้งหมด เพื่อตรวจสอบว่า Cron Jobs ที่ตั้งเวลาไว้ รันสำเร็จตามรอบหรือไม่ (Last run/Next run)

### `useExternalAPIStatus()`
&nbsp;&nbsp;&nbsp;&nbsp;ดึงค่า Latency (ms) และ Status Code ของ API ภายนอก โดยเชื่อมกับตาราง `platforms` เพื่อแสดงชื่อบริการ (เช่น Facebook, Google Ads) บอกว่าระบบภายนอกตัวไหนมีปัญหาการเชื่อมต่อ

### `useErrorLogStats()`
&nbsp;&nbsp;&nbsp;&nbsp;ดึงข้อมูล Error Logs 500 รายการล่าสุดมาจัดกลุ่มแยกตามความรุนแรง (Critical, Warning, Info) เพื่อสรุปยอดปัญหาที่เกิดขึ้นในระบบ และแจ้งเตือนให้ Admin ทราบทันที

### `usePerformanceMetrics()`
&nbsp;&nbsp;&nbsp;&nbsp;คำนวณภาพรวมสุขภาพระบบ (System Health Score) โดยหาค่าเฉลี่ยการใช้ CPU และ Memory จากเฉพาะเซิร์ฟเวอร์ที่สถานะปกติ (`healthy`) เพื่อแสดงเป็นมาตรวัดกราฟวงกลมที่หน้าแรก
