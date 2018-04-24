using System;
using Microsoft.AspNetCore.SpaServices.StaticFiles;
using Microsoft.Extensions.FileProviders;

namespace Assessment.Web
{
    public class EmbeddedSpaStaticFileProvider : ISpaStaticFileProvider
    {
        public EmbeddedSpaStaticFileProvider(EmbeddedSpaStaticFilesOptions options)
        {
            if (options == null)
                throw new ArgumentNullException(nameof(options));
            if (options.Assembly == null)
                throw new ArgumentException($"The Assembly property of {nameof(options)} cannot be null.");
            FileProvider = string.IsNullOrWhiteSpace(options.BaseNamespace)
                ? new EmbeddedFileProvider(options.Assembly)
                : new EmbeddedFileProvider(options.Assembly, options.BaseNamespace);
        }

        public IFileProvider FileProvider { get; }
    }
}