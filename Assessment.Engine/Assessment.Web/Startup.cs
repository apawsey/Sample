using Assessment.Web.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Reflection;
using Microsoft.Extensions.FileProviders;
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

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Info {Title = "Assessment.Web.Test3 API", Version = "v1"});

                c.AddSecurityDefinition("OpenID Connect", new OAuth2Scheme
                {
                    Type = "oauth2",
                    Flow = "password",
                    TokenUrl = "/connect/token"
                });
            });

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
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug(LogLevel.Warning);
            loggerFactory.AddFile(Configuration.GetSection("Logging"));

            Utilities.ConfigureLogger(loggerFactory);

            if (env.IsDevelopment())
                app.UseDeveloperExceptionPage();
            else
                app.UseExceptionHandler("/Home/Error");


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
                    "https://localhost:50010")
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

            app.UseSwagger();
            app.UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", "Assessment.Web API V1"); });


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