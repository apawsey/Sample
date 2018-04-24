using System.Reflection;

namespace Assessment.Web
{
    public class EmbeddedSpaStaticFilesOptions
    { 
        public Assembly Assembly { get; set; }
        public string BaseNamespace { get; set; }
    }
}