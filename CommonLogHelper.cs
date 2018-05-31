using NLog;
using System.Runtime.InteropServices;
using System.Text;

namespace MyToolBox.Integration.LogWebViewer
{
    public class CommonLogHelper
    {
        enum COMPUTER_NAME_FORMAT
        {
            ComputerNameNetBIOS,
            ComputerNameDnsHostname,
            ComputerNameDnsDomain,
            ComputerNameDnsFullyQualified,
            ComputerNamePhysicalNetBIOS,
            ComputerNamePhysicalDnsHostname,
            ComputerNamePhysicalDnsDomain,
            ComputerNamePhysicalDnsFullyQualified
        }
        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        static extern bool GetComputerNameEx(COMPUTER_NAME_FORMAT NameType,
            StringBuilder lpBuffer, ref uint lpnSize);
        /// <summary>
        /// The log helper static instance
        /// </summary>
        public static readonly CommonLogHelper Instance;

        static CommonLogHelper()
        {
            Instance = new CommonLogHelper();
        }
        private CommonLogHelper()
        {
            NLogger = NLog.LogManager.GetLogger("ApplicationLogger");

            LogManager.Configuration.Variables["JobName"] = "LogWebViewer";
            LogManager.Configuration.Variables["ServiceAccount"] = "service@mock.perficient.com";
            uint size = 1024;
            string computerName;
            StringBuilder name = new StringBuilder(1024);
            bool success = GetComputerNameEx(COMPUTER_NAME_FORMAT.ComputerNameDnsFullyQualified, name, ref size);
            if (!success)
                computerName = System.Environment.MachineName;
            else
                computerName = name.ToString();
            LogManager.Configuration.Variables["ComputerFullName"] = computerName;
        }
        
        public NLog.Logger NLogger
        {
            get;
            private set;
        }
    }
}