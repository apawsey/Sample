using System;
using Microsoft.AspNetCore.SpaServices.StaticFiles;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Assessment.Web
{
    public static class SpaEmbeddedStaticFilesExtensions
    {
        public static void AddEmbeddedSpaStaticFiles(this IServiceCollection services,
            Action<EmbeddedSpaStaticFilesOptions> configuration)
        {
            services.AddSingleton(serviceProvider =>
            {
                EmbeddedSpaStaticFilesOptions options =
                    serviceProvider.GetService<IOptions<EmbeddedSpaStaticFilesOptions>>().Value;
                Action<EmbeddedSpaStaticFilesOptions> action = configuration;
                action?.Invoke(options);
                return (ISpaStaticFileProvider) new EmbeddedSpaStaticFileProvider(options);
            });
        }
    }
}