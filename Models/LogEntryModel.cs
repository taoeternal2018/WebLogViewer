namespace WebLogViewer.Models
{
    public class LogEntryModel
    {
        public string Date { get; set; }
        public string Level { get; set; }
        public string Logger { get; set; }
        public string ServiceAccount { get; set; }
        public string ServerName { get; set; }
        public string Message { get; set; }
    }
}