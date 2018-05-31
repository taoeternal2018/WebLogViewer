using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace WebLogViewer.Models
{
    public class PagedFileReader
    {
        public PagedFileReader(string path, int pgSize)
        {
            Path = path;
            PageSize = pgSize;
        }

        public int GetTotalPages(out int itemAmount)
        {
            int NumberOfRetries = 3;
            itemAmount = 0;
            int pageAmount = 0;
            for (int i = 1; i <= NumberOfRetries; ++i)
            {
                try
                {
                    var allLines = File.ReadAllLines(Path);
                    itemAmount = allLines.Length;
                    pageAmount =  (int)Math.Ceiling((decimal)itemAmount / PageSize);
                }
                catch (IOException)
                {
                    if (i == NumberOfRetries)
                    {
                        string err = "Failure limit has reached in GetTotalPages, please try later.";

                        CommonLogHelper.Instance.NLogger.Error(err);
                        throw new Exception(err);
                    }
                    else
                    {
                        System.Threading.Thread.Sleep(1000);
                        continue;
                    }
                }
            }
            return pageAmount;
        }
        public string[] GetPageLines(int page)
        {
            string[] array = new string[PageSize];
            int counter = PageSize;
            try
            {
                IEnumerable<string> lines = File.ReadAllLines(Path);
                IEnumerable<string> reversedLines = lines.Reverse();
                int currentItems = reversedLines.Count() - (page - 1) * PageSize;
                bool isLessThanPageSize = currentItems / PageSize < 1;
                if (isLessThanPageSize)
                    counter = currentItems % PageSize;
                for (int i = 0; i < counter; i++)
                {
                    array[i] = reversedLines.Skip((page - 1) * PageSize + i).First();
                }
            }
            catch (Exception ex)
            {
                CommonLogHelper.Instance.NLogger.Error(ex.Message);
                throw (ex);
            }

            return array;
        }

        public string Path { get; set; }
        public int PageSize { get; set; }
    }
}