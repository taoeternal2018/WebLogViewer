using MyToolBox.Integration.LogWebViewer.Models;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace MyToolBox.Integration.LogWebViewer.Controllers
{
    public class JobController : ApiController
    {
        public IOrderedEnumerable<dynamic> getJobs()
        {
            List<dynamic> ret = new List<dynamic>();
            string sectionName = "Jobs";
            try
            {
                IDictionary dict = System.Configuration.ConfigurationManager.GetSection(sectionName) as IDictionary;
                foreach (DictionaryEntry e in dict)
                {
                    dynamic dyn = new ExpandoObject();
                    dyn.Name = e.Key.ToString();
                    dyn.Path = e.Value.ToString();
                    ret.Add(dyn);
                }
            }
            catch {
                var resp = new HttpResponseMessage(HttpStatusCode.NotFound)
                {
                    ReasonPhrase = string.Format("Can't find section[{0}] in configuration file", sectionName)
                };
                throw new HttpResponseException(resp);
            }

            var orderedJob = from job in ret orderby job.Name descending select job;
            return orderedJob;
        }
        public dynamic getTotalPages(string path, int pageSize,string date = "")
        {
            dynamic logInfo = new ExpandoObject();

            try
            {
                DateTime dt;
                LogFileModel lfm = new LogFileModel(DateTime.TryParse(date, out dt) ? dt : DateTime.Now, path, pageSize);
                int itemAmount;

                logInfo.Pages = lfm.GetTotalPages(out itemAmount);
                logInfo.Items = itemAmount;
            }
            catch(Exception ex)
            {
                logInfo.hasError = true;
                logInfo.errorMessage = ex.Message;
                var resp = new HttpResponseMessage(HttpStatusCode.NotFound)
                {
                    ReasonPhrase = ex.Message
                };
                throw new HttpResponseException(resp);
            }

            return logInfo;
        }
    }
}
