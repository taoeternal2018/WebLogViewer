using WebLogViewer.Models;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace WebLogViewer.Controllers
{
    public class LogController : ApiController
    {
        public dynamic get(string date,string path,int pageSize,int page)
        {
            dynamic logs = new ExpandoObject();
            try
            {
                DateTime dt;
                LogFileModel lfm = new LogFileModel(DateTime.TryParse(date, out dt) ? dt : DateTime.Now, path, pageSize, page);
                logs.items = lfm.LogEntryItems;
            }
            catch(Exception ex)
            {
                logs.hasError = true;
                logs.errorMessage = ex.Message;
                var resp = new HttpResponseMessage(HttpStatusCode.NotFound)
                {
                    ReasonPhrase = ex.Message
                };
                throw new HttpResponseException(resp);
            }

            return logs;
        }
    }
}
