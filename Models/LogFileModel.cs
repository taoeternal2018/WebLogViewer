using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;

namespace WebLogViewer.Models
{
    [DataContract]
    public class LogFileModel
    {
        private readonly string[] _fields;

        private readonly int _levelIndex;

        public LogFileModel()
        {
            LogEntryItems = new List<LogEntryModel>();
            _fields = Config.Instance.FieldsList;
            Num = _fields.Length;
            _levelIndex = _fields.Select(item => !string.IsNullOrEmpty(item) ? item.ToLowerInvariant() : string.Empty).ToList().IndexOf("level");
        }

        public LogFileModel(DateTime date, string path, int pageSize) : this()
        {
            string logsPath = path.StartsWith("~") ?
                                System.Web.Hosting.HostingEnvironment.MapPath(path) : path;
            try
            {
                Initial(logsPath, date, pageSize);
            }
            catch (Exception ex)
            {
                CommonLogHelper.Instance.NLogger.Error(ex.Message);
                throw (ex);
            }
        }

        public LogFileModel(DateTime date, string path, int pageSize, int page) : this()
        {
            string logsPath = path.StartsWith("~") ?
                                System.Web.Hosting.HostingEnvironment.MapPath(path) : path;
            try
            {
                Initial(logsPath, date, pageSize, page);
            }
            catch (Exception ex)
            {
                CommonLogHelper.Instance.NLogger.Error(ex.Message);
                throw (ex);
            }
        }

        public void Initial(string logsPath, DateTime date, int pageSize, int page)
        {
            try
            {
                Initial(logsPath, date, pageSize);

                if (Reader != null)
                {
                    var pageLines = Reader.GetPageLines(page);

                    foreach (var aline in pageLines)
                    {
                        if (!string.IsNullOrEmpty(aline))
                            LogEntryItems.Add(GetItemFrom(aline));
                    }
                }
            }
            catch (Exception ex)
            {
                CommonLogHelper.Instance.NLogger.Error(ex.Message);
                throw (ex);
            }
        }

        public void Initial(string logsPath, DateTime date, int pageSize)
        {
            Date = date;

            string logFile = Path.Combine(logsPath, Config.Instance.FileFormat.Contains("{0") ? string.Format(Config.Instance.FileFormat, date) : Config.Instance.FileFormat);

            if (!File.Exists(logFile))
            {
                return;
            }
            try
            {
                Reader = new PagedFileReader(logFile, pageSize);
            }
            catch (Exception ex)
            {
                CommonLogHelper.Instance.NLogger.Error(ex.Message);
                throw (ex);
            }
        }

        private LogEntryModel GetItemFrom(string aline)
        {
            LogEntryModel logItem = null;
            var items = aline.Split(new[] { Config.Instance.Separator }, StringSplitOptions.None);

            if (items.Length == Num)
            {
                logItem = new LogEntryModel();

                logItem.Date = items[0];
                logItem.ServiceAccount = items[1];
                logItem.ServerName = items[2];
                logItem.Level = items[3];
                logItem.Logger = items[4];
                logItem.Message = items[5];

            }
            return logItem;
        }

        public int GetTotalPages(out int itemAmount )
        {
            if (Reader == null)
            {
                itemAmount = 0;
                return 0;
            }
            return Reader.GetTotalPages(out itemAmount);
        }

        public int Num { get; private set; }

        public DateTime Date { get; set; }

        [DataMember]
        public long LastId { get; private set; }

        public PagedFileReader Reader { get; private set; }

        public List<LogEntryModel> LogEntryItems { get; set; }
    }
}