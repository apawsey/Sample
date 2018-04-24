using System;
using Assessment.Web.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging.Console;
using Microsoft.Extensions.Primitives;
using Swashbuckle.AspNetCore.Swagger;

namespace Assessment.Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }


        public void ConfigureServices(IServiceCollection services)
        {
            // Add cors
            services.AddCors();

            services.AddMvc();

#if DEBUG
            services.AddSpaStaticFiles(options => { options.RootPath = "clientapp/dist"; });
#else
            services.AddEmbeddedSpaStaticFiles(options =>
            {
                options.Assembly = Assembly.GetExecutingAssembly();
                options.BaseNamespace = "Assessment.Web.clientapp.dist";
            });
#endif
            services.AddSignalR();
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.Authority = "https://assessmentweb.auth0.com/";
                options.Audience = "https://localhost:5000/calculate";
            });
        }


        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, ILogger<Startup> logger)
        {
            loggerFactory.AddConsole(LogLevel.Warning);
            loggerFactory.AddDebug(LogLevel.Warning);

            Utilities.ConfigureLogger(loggerFactory);

#if DEBUG
            app.UseDeveloperExceptionPage();
#else
            app.UseExceptionHandler("/Home/Error");
#endif

            app.UseCors(builder => builder
                .WithOrigins("https://localhost:5000",
                    "https://localhost:5001",
                    "https://localhost:5002",
                    "https://localhost:5003",
                    "https://localhost:5004",
                    "https://localhost:5005",
                    "https://localhost:5006",
                    "https://localhost:5007",
                    "https://localhost:5008",
                    "https://localhost:5009",
                    "https://localhost:5010")
                .AllowCredentials()
                .AllowAnyHeader()
                .AllowAnyMethod());


#if DEBUG
            app.UseStaticFiles();
#else
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider =
 new EmbeddedFileProvider(Assembly.GetExecutingAssembly(), "Assessment.Web.clientapp.dist")
            });
#endif
            app.UseSpaStaticFiles();
            app.UseAuthentication();

            app.UseSignalR(routes => { routes.MapHub<CalculateHub>("/calculationHub"); });

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    "default",
                    "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";
#if DEBUG
                if (env.IsDevelopment()) spa.UseAngularCliServer("start");
#endif
            });
        }
    }
}