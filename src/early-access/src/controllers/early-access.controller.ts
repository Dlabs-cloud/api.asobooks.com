import { Body, Controller, Delete, Get, Inject, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { EarlyAccessService } from '../contracts/early-access-service.interface';
import { SubscribeDto } from '../dtos/subcribe.dto';
import { ConfigImpl } from '../impl/config.impl';
import { ViewCompilerImpl } from '../impl/view-compiler.impl';
import { Public } from '../../../conf/security/annotations/public';

@Public()
@Controller('early-access')
export class EarlyAccessController {

  constructor(@Inject(EarlyAccessService) private readonly earlyAccessService: EarlyAccessService,
              private readonly configService: ConfigImpl) {

  }

  @Get()
  public async index(@Res() res: Response) {
    let assetsPaths = `${__dirname}/../../../../../src/early-access/assets`;
    let data = {
      showShareWithTwitter: !!this.configService.getTwitterHandle(),
      assetsPaths,
    };

    let viewPath = `${__dirname}/../../../../../src/early-access/views/index.ejs`;
    let view = new ViewCompilerImpl().compileView(viewPath, data);
    return res.send(view);
  }

  @Post()
  public async subscribe(@Body() subscribeDto: SubscribeDto, @Req() request: Request, @Res() res: Response) {
    this.earlyAccessService.subscribe(subscribeDto.email, subscribeDto.name)
      .then(isSubscribed => {
        let url = `${request.baseUrl}/early-access?isSubscribed=${isSubscribed}`;
        res.redirect(url);
      }).catch(error => {
      let url = `${request.baseUrl}/early-access?isSubscribed=${false}`;
      res.redirect(url);
    });
  }

  @Delete('/:email')
  public unSubscribe(@Param('email') email: string, @Req() req: Request, @Res() res: Response) {
    this.earlyAccessService.unSubscribe(email).then(unSubscribe => {
      let url = `${req.baseUrl}/early-access?unSubscribe=${unSubscribe}`;
      res.redirect(url);
    }).catch(error => {
      let url = `${req.baseUrl}/early-access?unSubscribe=${false}`;
      res.redirect(url);
    });
  }

  @Get('/twitter-share')
  public shareOnTwitter(@Req() request: Request, @Res() response: Response) {
    let twitterHandle = this.configService.getTwitterHandle();
    let url = `${request.baseUrl}/early-access`;
    if (twitterHandle) {
      let twitterShareMessage = this.configService.twitterShareMessage();
      url = twitterShareMessage ?? `@${twitterHandle}is coming soon. Request early access to be one of the first people to try it out ${url}`;
      let redirectURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(url)}&related=${twitterHandle}&handle=${twitterHandle}`;
      response.redirect(redirectURL);
      return;
    }

    response.redirect(url);

  }
}